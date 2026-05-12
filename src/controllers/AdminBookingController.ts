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

  /** Ensure `user` relation is loaded with profile fields (signup / registration). */
  protected async afterShow(record: ExtendedBooking): Promise<ExtendedBooking> {
    if (record?.userId == null) return record;
    const userRow = await prisma.user.findUnique({
      where: { id: record.userId },
      select: {
        name: true,
        lname: true,
        email: true,
        mobileNumber: true,
        emergencyname: true,
        emergencyNumber: true,
        streetAddress: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        vetName: true,
      },
    });
    if (!userRow) return record;
    return { ...record, user: userRow as ExtendedBooking["user"] };
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
    (this as any)._petIdsTemp = (this.data as any).petIds;
    (this as any)._scheduleTemp = (this.data as any).schedule;

    delete (this.data as any).employeeId;
    delete (this.data as any).petId;
    delete (this.data as any).petIds;
    delete (this.data as any).schedule;
  }

  /** Normalize pet id list from body: `petIds` array or JSON string, else single `petId`. */
  private parsePetIdsFromStorePayload(): number[] {
    const rawIds = (this as any)._petIdsTemp;
    const single = Number((this as any)._petIdTemp);
    const fromNumber = (v: unknown): number | null => {
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
    };

    let out: number[] = [];
    if (Array.isArray(rawIds)) {
      out = rawIds.map(fromNumber).filter((n): n is number => n != null);
    } else if (typeof rawIds === "string" && rawIds.trim() !== "") {
      try {
        const parsed = JSON.parse(rawIds) as unknown;
        if (Array.isArray(parsed)) {
          out = parsed.map(fromNumber).filter((n): n is number => n != null);
        }
      } catch {
        out = [];
      }
    }
    if (out.length === 0 && Number.isFinite(single) && single > 0) {
      out = [Math.trunc(single)];
    }
    return [...new Set(out)];
  }

  // ------------------- AFTER STORE -------------------
  protected async afterStore(record: ExtendedBooking): Promise<ExtendedBooking> {

    const employeeId = Number((this as any)._employeeIdTemp);
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

    const petIdsRequested = this.parsePetIdsFromStorePayload();
    const ownedPets = await prisma.pet.findMany({
      where: {
        id: { in: petIdsRequested },
        userId: record.userId,
        deletedAt: null,
      },
      select: { id: true },
    });
    const validPetIds = ownedPets.map((p) => p.id);

    if (effectiveEmployeeId > 0 && validPetIds.length > 0 && schedule.length > 0) {
      for (let i = 0; i < schedule.length; i++) {
        const item = schedule[i];
        const scheduleDate = item?.schedule_date;
        const scheduleTime = item?.schedule_time;
        if (!scheduleDate || scheduleTime == null) continue;
        const dateVal = new Date(`${scheduleDate}T00:00:00`);
        const timeVal = String(scheduleTime);
        for (const pid of validPetIds) {
          await prisma.bookingSchedule.create({
            data: {
              bookingId: record.id,
              employeeId: effectiveEmployeeId,
              petId: pid,
              serviceCategoryId: record.serviceCategoryId,
              serviceId: record.serviceId,
              scheduleDate: dateVal,
              scheduleTime: timeVal,
            },
          });
        }
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
    // Keep booking_schedules.employeeId aligned with booking.assignedTo (admin employee select).
    if (record.id != null && record.assignedTo != null) {
      const syncEmpId = Number(record.assignedTo);
      if (
        Number.isFinite(syncEmpId) &&
        !Number.isNaN(syncEmpId) &&
        syncEmpId > 0
      ) {
        await prisma.bookingSchedule.updateMany({
          where: { bookingId: record.id, deletedAt: null },
          data: { employeeId: syncEmpId },
        });
      }
    }

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
