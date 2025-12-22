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
};

export default class AdminBookingResource extends BaseResource<ExtendedBooking> {
  
  // Transform a single record
  async toArray(booking: ExtendedBooking): Promise<Record<string, unknown>> {
    return {
      id: booking.id,
      userId: booking.userId,
      assignedTo: booking.assignedTo,
      serviceCategoryId: booking.serviceCategoryId,
      serviceId: booking.serviceId,
      quantity: booking.quantity,
      tax: booking.tax,
      discount: booking.discount,
      totalPrice: booking.totalPrice,
      isPaid: booking.isPaid,
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      deletedAt: booking.deletedAt,
    };
  }

  // Transform a collection of records
  async collection(records: ExtendedBooking[]): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map(r => this.toArray(r)));
  }
}

