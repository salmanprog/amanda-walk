import BaseResource from "@/resources/BaseResource";
import { BookingStatus as BookingStatusEnum } from "@prisma/client";

// Extend Booking type to include relations
export type ExtendedBooking = {
  id?: number;
  userId: number;
  assignedTo: number;
  serviceCategoryId: number;
  serviceId: number;
  quantity: number;
  tax: number;
  discount: number;
  totalPrice: number;
  isPaid: boolean;
  status: BookingStatusEnum;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  user?: { name?: string | null; lname?: string | null; email?: string | null; mobileNumber?: string | null } | null;
  category?: { title?: string } | null;
  service?: { title?: string; mints?: string } | null;
  schedules?: Array<{
    id?: number;
    employeeId: number;
    scheduleDate: Date;
    scheduleTime: string;
    scheduleSlot?: string | null;
    isStarted: boolean;
    isCompleted: boolean;
  }>;
};

export default class AdminBookingResource extends BaseResource<ExtendedBooking> {
  
  // Transform a single record
  async toArray(booking: ExtendedBooking): Promise<Record<string, unknown>> {
    const userName = booking.user
      ? [booking.user.name, booking.user.lname].filter(Boolean).join(" ") || "—"
      : "—";
    const userEmail = booking.user?.email ?? "—";
    const userPhone = booking.user?.mobileNumber ?? "—";
    const categoryName = booking.category?.title ?? "—";
    const serviceName = booking.service?.title ?? "—";
    const mintsRaw = booking.service?.mints;
    const mintsStr = mintsRaw != null ? String(mintsRaw).trim() : "";
    const serviceMints = mintsStr !== "" ? mintsStr : null;
    const firstSchedule = booking.schedules?.[0];
    const schedules = (booking.schedules ?? []).map((s) => ({
      id: (s as { id?: number }).id,
      employeeId: s.employeeId,
      scheduleDate: s.scheduleDate,
      scheduleTime: s.scheduleTime,
      scheduleSlot: (s as { scheduleSlot?: string | null }).scheduleSlot ?? null,
      isStarted: s.isStarted,
      isCompleted: s.isCompleted,
    }));
    return {
      id: booking.id,
      userId: booking.userId,
      assignedTo: booking.assignedTo,
      serviceCategoryId: booking.serviceCategoryId,
      serviceId: booking.serviceId,
      userName,
      userEmail,
      userPhone,
      categoryName,
      serviceName,
      serviceMints,
      quantity: booking.quantity,
      tax: booking.tax,
      discount: booking.discount,
      totalPrice: booking.totalPrice,
      isPaid: booking.isPaid,
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      deletedAt: booking.deletedAt,
      scheduleDate: firstSchedule?.scheduleDate ?? null,
      scheduleTime: firstSchedule?.scheduleTime ?? null,
      isStarted: firstSchedule?.isStarted ?? false,
      isCompleted: firstSchedule?.isCompleted ?? false,
      schedules,
    };
  }

  // Transform a collection of records
  async collection(records: ExtendedBooking[]): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map(r => this.toArray(r)));
  }
}

