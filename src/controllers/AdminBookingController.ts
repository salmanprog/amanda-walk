import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import { NextResponse } from "next/server";
import AdminBookingHook from "@/hooks/AdminBookingHook";
import AdminBookingResource from "@/resources/AdminBookingResource";
import { storeBooking, updateBooking } from "@/validators/user.validation";
import type { ExtendedBooking } from "@/resources/AdminBookingResource";

export default class AdminBookingController extends RestController<
  any,
  ExtendedBooking
> {
  constructor(req?: Request, data?: Partial<ExtendedBooking>) {
    super((prisma as any).booking as any, req);

    this.data = data ?? {};
    this.resource = AdminBookingResource;
    this.hook = AdminBookingHook;
  }

  // ------------------- Validation -------------------
  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storeBooking, this.data ?? {});
      case "update":
        return await this.__validate(updateBooking, this.data ?? {});
    }
  }

  // ------------------- Hooks -------------------
  protected async beforeIndex(): Promise<void | NextResponse> {
    this.getCurrentUser();
  }

  protected async beforeStore(): Promise<void | NextResponse> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }

    this.data = this.data ?? {};
    (this.data as any).userId = currentUser.id;

    if (this.data?.serviceCategoryId !== undefined) {
      this.data.serviceCategoryId = Number(this.data.serviceCategoryId);
    }

    if (this.data?.serviceId !== undefined) {
      this.data.serviceId = Number(this.data.serviceId);
    }

    if (this.data?.quantity !== undefined) {
      this.data.quantity = Number(this.data.quantity);
    }

    (this as any)._employeeIdTemp = (this.data as any).employeeId;
    (this as any)._petIdTemp = (this.data as any).petId;
    (this as any)._scheduleTemp = (this.data as any).schedule;

    delete (this.data as any).employeeId;
    delete (this.data as any).petId;
    delete (this.data as any).schedule;
  }

  // ------------------- AFTER STORE -------------------
  protected async afterStore(record: ExtendedBooking): Promise<ExtendedBooking> {

    const employeeId = Number((this as any)._employeeIdTemp);
    const petId = Number((this as any)._petIdTemp);
    let schedule: any[] = [];
    const temp = (this as any)._scheduleTemp;
    schedule = typeof temp === 'string' ? JSON.parse(temp) : [];

    if (!record.id) {
        throw new Error("Booking ID missing after store");
    }

    for (let i = 0; i < schedule.length; i++) {

      await prisma.bookingSchedule.create({
          data: {
            bookingId: record.id,
            employeeId: employeeId,
            petId: petId,
            serviceCategoryId: record.serviceCategoryId,
            serviceId: record.serviceId,
            scheduleDate: new Date(`${schedule[i].schedule_date}T00:00:00`),
            scheduleTime: schedule[i].schedule_time,
          }
        });

    }

    return record;
  }

  // ------------------- UPDATE / DELETE -------------------
  protected async beforeUpdate(): Promise<void | NextResponse> {}

  protected async afterUpdate(record: ExtendedBooking): Promise<ExtendedBooking> {
    return record;
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    const currentUser = this.requireUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
  }
}
