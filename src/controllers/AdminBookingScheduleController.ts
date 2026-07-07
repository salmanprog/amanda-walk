import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import { NextResponse } from "next/server";
import AdminTransactionController from "@/controllers/AdminTransactionController";

export type ExtendedBookingSchedule = {
  id?: number;
  bookingId: number;
  employeeId: number;
  petId: number;
  serviceCategoryId: number;
  serviceId: number;
  scheduleDate: Date;
  scheduleTime: string;
  scheduleSlot?: string | null;
  isStarted: boolean;
  isCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

export default class AdminBookingScheduleController extends RestController<
  typeof prisma.bookingSchedule,
  ExtendedBookingSchedule
> {
  constructor(req?: Request, data?: Partial<ExtendedBookingSchedule>) {
    super(prisma.bookingSchedule as never, req);
    this.data = data ?? {};
  }

  protected async afterUpdate(
    record: ExtendedBookingSchedule
  ): Promise<ExtendedBookingSchedule> {
    if (!record.isCompleted || !record.bookingId || record.id == null) {
      return record;
    }

    const booking = await prisma.booking.findUnique({
      where: { id: record.bookingId, deletedAt: null },
      select: {
        userId: true,
        totalPrice: true,
        service: { select: { price: true } },
      },
    });

    if (!booking) {
      return record;
    }

    const scheduleCount = await prisma.bookingSchedule.count({
      where: { bookingId: record.bookingId, deletedAt: null },
    });

    const bookingTotal = Number(booking.totalPrice);
    let bookingAmount =
      scheduleCount > 0 && bookingTotal > 0
        ? bookingTotal / scheduleCount
        : bookingTotal;

    if (!Number.isFinite(bookingAmount) || bookingAmount <= 0) {
      const servicePrice = Number(booking.service?.price ?? 0);
      bookingAmount = servicePrice > 0 ? servicePrice : 0;
    }

    const transactionController = new AdminTransactionController(this.__request);
    await transactionController.recordFromScheduleCompletion({
      userId: booking.userId,
      employeeId: record.employeeId,
      bookingId: record.bookingId,
      bookingScheduleId: record.id,
      bookingAmount,
    });

    return record;
  }
}
