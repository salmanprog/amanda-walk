import BaseResource from "@/resources/BaseResource";
import { TransactionStatus } from "@prisma/client";

export type ExtendedTransaction = {
  id?: number;
  userId: number;
  employeeId: number;
  bookingId: number;
  bookingScheduleId?: number | null;
  bookingAmount: number | string | { toString(): string };
  status: TransactionStatus;
  createdAt?: Date;
  updatedAt?: Date;
};

export type GroupedTransactionSummary = {
  userId: number;
  userName?: string | null;
  userEmail?: string | null;
  totalTransaction?: number | string | { toString(): string };
  transactionCount: number;
  payTransaction?: number | string | { toString(): string };
  remainingTransaction?: number | string | { toString(): string };
};

export default class AdminTransactionResource extends BaseResource<ExtendedTransaction> {
  async summaryToArray(record: GroupedTransactionSummary): Promise<Record<string, unknown>> {
    return {
      userId: record.userId,
      userName: record.userName ?? null,
      userEmail: record.userEmail ?? null,
      totalBookingAmount:
        record.totalTransaction != null ? Number(record.totalTransaction) : 0,
      transactionCount: record.transactionCount,
      receivedAmount:
        record.payTransaction != null ? Number(record.payTransaction) : 0,
      remainingAmount:
        record.remainingTransaction != null ? Number(record.remainingTransaction) : 0,
    };
  }

  async summaryCollection(
    records: GroupedTransactionSummary[]
  ): Promise<Record<string, unknown>[]> {
    if (!Array.isArray(records)) return [];
    return Promise.all(records.map((r) => this.summaryToArray(r)));
  }

  async toArray(record: ExtendedTransaction): Promise<Record<string, unknown>> {
    return {
      id: record.id,
      userId: record.userId,
      employeeId: record.employeeId,
      bookingId: record.bookingId,
      bookingScheduleId: record.bookingScheduleId ?? null,
      bookingAmount: record.bookingAmount != null ? Number(record.bookingAmount) : null,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
