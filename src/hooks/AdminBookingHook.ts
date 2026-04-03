import { BookingStatus } from "@prisma/client";
import { getHookUser } from "@/utils/hookUser";

export default class AdminBookingHook {

  // For listing multiple bookings
  static async indexQueryHook(
    query: any,
    request?: Record<string, unknown>
  ): Promise<any> {
    const user = getHookUser(request);
    query.where = { ...query.where, deletedAt: null };
    // For non–super-admin: only show non-cancelled bookings (status is BookingStatus enum, not boolean)
    if (!user || user.userGroupId !== 1) {
      query.where = {
        ...query.where,
        status: { not: BookingStatus.CANCELLED },
      };
    }
    query.orderBy = {
      createdAt: "desc",
    };
    query.include = {
      user: { select: { name: true, lname: true } },
      category: { select: { title: true } },
      service: { select: { title: true, mints: true } },
      schedules: {
        where: { deletedAt: null },
        select: {
          employeeId: true,
          scheduleDate: true,
          scheduleTime: true,
          scheduleSlot: true,
          isStarted: true,
          isCompleted: true,
        },
        orderBy: { scheduleDate: "asc" },
      },
    };
    return query;
  }

  // For fetching a single booking by id or slug
  static async showQueryHook(
    query: any,
    request?: Record<string, unknown>
  ): Promise<any> {
    query.where = { ...query.where, deletedAt: null };
    query.include = {
      user: { select: { name: true, lname: true, email: true, mobileNumber: true } },
      category: { select: { title: true } },
      service: { select: { title: true, mints: true } },
      schedules: {
        where: { deletedAt: null },
        select: {
          id: true,
          employeeId: true,
          scheduleDate: true,
          scheduleTime: true,
          scheduleSlot: true,
          isStarted: true,
          isCompleted: true,
        },
        orderBy: { scheduleDate: "asc" },
      },
    };
    return query;
  }

  // Before creating a new bookings
  static async beforeCreateHook(
    data: any
  ): Promise<any> {
    return data;
  }
}

