import type { Prisma } from "@prisma/client";
import { UserType } from "@prisma/client";
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
    if (typeof temp === "string") {
      try {
        const parsed = JSON.parse(temp);
        schedule = Array.isArray(parsed) ? parsed : [];
      } catch {
        schedule = [];
      }
    } else if (Array.isArray(temp)) {
      schedule = temp;
    }

    if (!record.id) {
      throw new Error("Booking ID missing after store");
    }

    // Resolve employeeId: use provided value if valid, else fallback to Employee then ADMIN (frontend often sends 0)
    let effectiveEmployeeId = Number.isInteger(employeeId) && employeeId > 0 ? employeeId : 0;
    if (effectiveEmployeeId === 0) {
      const fallback = await prisma.user.findFirst({
        where: { userType: UserType.Employee, status: true },
        select: { id: true },
      });
      effectiveEmployeeId = fallback?.id ?? 0;
    }
    if (effectiveEmployeeId === 0) {
      const adminFallback = await prisma.user.findFirst({
        where: { userType: UserType.ADMIN, status: true },
        select: { id: true },
      });
      effectiveEmployeeId = adminFallback?.id ?? 0;
    }

    const validPetId = Number.isFinite(petId) && petId > 0 ? petId : 0;
    if (effectiveEmployeeId > 0 && validPetId > 0 && schedule.length > 0) {
      for (let i = 0; i < schedule.length; i++) {
        const item = schedule[i];
        const scheduleDate = item?.schedule_date;
        const scheduleTime = item?.schedule_time;
        if (!scheduleDate || scheduleTime == null) continue;
        await prisma.bookingSchedule.create({
          data: {
            bookingId: record.id,
            employeeId: effectiveEmployeeId,
            petId: validPetId,
            serviceCategoryId: record.serviceCategoryId,
            serviceId: record.serviceId,
            scheduleDate: new Date(`${scheduleDate}T00:00:00`),
            scheduleTime: String(scheduleTime),
          },
        });
      }
    }

    return record;
  }

  // ------------------- UPDATE / DELETE -------------------
  protected async beforeUpdate(): Promise<void | NextResponse> {
    const raw = this.data as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(raw, "scheduleSlot")) {
      (this as { _scheduleSlotToPersist?: unknown })._scheduleSlotToPersist =
        raw.scheduleSlot;
      delete raw.scheduleSlot;
    } else {
      (this as { _scheduleSlotToPersist?: unknown })._scheduleSlotToPersist =
        undefined;
    }
  }

  protected async afterUpdate(record: ExtendedBooking): Promise<ExtendedBooking> {
    const slot = (this as { _scheduleSlotToPersist?: unknown })
      ._scheduleSlotToPersist;
    if (slot !== undefined && record.id != null) {
      const empId =
        record.assignedTo != null ? Number(record.assignedTo) : null;
      let value: string | null = null;
      if (slot === null) {
        value = null;
      } else {
        const s = String(slot).trim();
        value = s === "" ? null : s.slice(0, 20);
      }
      const baseWhere = {
        bookingId: record.id,
        deletedAt: null,
      };
      const empOk =
        empId != null && !Number.isNaN(empId) && Number.isFinite(empId);
      if (empOk) {
        const matchEmp = await prisma.bookingSchedule.count({
          where: { ...baseWhere, employeeId: empId },
        });
        if (matchEmp > 0) {
          await prisma.bookingSchedule.updateMany({
            where: { ...baseWhere, employeeId: empId },
            data: { scheduleSlot: value },
          });
        } else {
          await prisma.bookingSchedule.updateMany({
            where: baseWhere,
            data: { scheduleSlot: value },
          });
        }
      } else {
        await prisma.bookingSchedule.updateMany({
          where: baseWhere,
          data: { scheduleSlot: value },
        });
      }
    }
    let showQuery: Record<string, unknown> = {
      where: { id: record.id, deletedAt: null },
    };
    showQuery = await AdminBookingHook.showQueryHook(showQuery, {});
    const fresh = await prisma.booking.findUnique(
      showQuery as Prisma.BookingFindUniqueArgs
    );
    return (fresh ?? record) as ExtendedBooking;
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    const currentUser = this.requireUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
  }
}
