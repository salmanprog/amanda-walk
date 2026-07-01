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
      select: { userId: true, totalPrice: true },
    });

    if (!booking) {
      return record;
    }

    const transactionController = new AdminTransactionController(this.__request);
    await transactionController.recordFromScheduleCompletion({
      userId: booking.userId,
      employeeId: record.employeeId,
      bookingId: record.bookingId,
      bookingScheduleId: record.id,
      bookingAmount: Number(booking.totalPrice),
    });

    return record;
  }
}
