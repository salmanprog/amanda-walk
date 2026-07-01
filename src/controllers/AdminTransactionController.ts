import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import AdminTransactionHook from "@/hooks/AdminTransactionHook";
import AdminTransactionResource from "@/resources/AdminTransactionResource";
import { storeTransaction } from "@/validators/user.validation";
import type {
  ExtendedTransaction,
  GroupedTransactionSummary,
} from "@/resources/AdminTransactionResource";
import { NextResponse } from "next/server";

const TRANSACTION_COMPLETED = "COMPLETED" as const;

export default class AdminTransactionController extends RestController<
  typeof prisma.transaction,
  ExtendedTransaction
> {
  constructor(req?: Request, data?: Partial<ExtendedTransaction>) {
    super(prisma.transaction as never, req);
    this.data = data ?? {};
    this.resource = AdminTransactionResource;
    this.hook = AdminTransactionHook;
  }

  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storeTransaction, this.data ?? {});
    }
  }

  async index(): Promise<NextResponse> {
    try {
      await this.beforeIndex();

      const grouped = await prisma.transaction.groupBy({
        by: ["userId"],
        _sum: { bookingAmount: true },
        _count: { id: true },
        orderBy: { userId: "asc" },
      });

      const userIds = grouped.map((row) => row.userId);
      const users =
        userIds.length > 0
          ? await prisma.user.findMany({
              where: { id: { in: userIds }, deletedAt: null },
              select: {
                id: true,
                name: true,
                email: true,
                totalTransaction: true,
                payTransaction: true,
                remainingTransaction: true,
              },
            })
          : [];

      const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

      const records: GroupedTransactionSummary[] = grouped.map((row) => ({
        userId: row.userId,
        userName: userMap[row.userId]?.name ?? null,
        userEmail: userMap[row.userId]?.email ?? null,
        totalTransaction: userMap[row.userId]?.totalTransaction ?? 0,
        transactionCount: row._count.id ?? 0,
        payTransaction: userMap[row.userId]?.payTransaction ?? 0,
        remainingTransaction: userMap[row.userId]?.remainingTransaction ?? 0,
      }));

      const resource = new AdminTransactionResource();
      const transformedData = await resource.summaryCollection(records);

      return NextResponse.json(
        { code: 200, message: this.messages.list, data: transformedData },
        { status: 200 }
      );
    } catch (err) {
      return this.sendError((err as Error).message, {}, 500);
    }
  }

  /** Create a transaction when an employee completes a booking schedule. */
  async recordFromScheduleCompletion(
    payload: Pick<
      ExtendedTransaction,
      "userId" | "employeeId" | "bookingId" | "bookingAmount" | "bookingScheduleId"
    >
  ): Promise<ExtendedTransaction> {
    if (payload.bookingScheduleId != null) {
      const existing = await prisma.transaction.findFirst({
        where: { bookingScheduleId: payload.bookingScheduleId },
      });
      if (existing) {
        return existing as unknown as ExtendedTransaction;
      }
    }

    const data: Partial<ExtendedTransaction> = {
      ...payload,
      status: TRANSACTION_COMPLETED,
    };
    this.data = data;

    const validation = await this.validation("store");
    if (validation && "success" in validation && !validation.success) {
      throw new Error(validation.message || "Transaction validation failed");
    }

    const requestData: Record<string, unknown> = this.__request
      ? {
          query: Object.fromEntries(new URL(this.__request.url).searchParams),
          headers: Object.fromEntries(this.__request.headers.entries()),
          method: this.__request.method,
        }
      : {};

    const hookData = await this.getQueryHook("beforeCreate", {}, requestData);
    const finalData = { ...data, ...hookData };

    const created = await prisma.transaction.create({
      data: {
        userId: Number(finalData.userId),
        employeeId: Number(finalData.employeeId),
        bookingId: Number(finalData.bookingId),
        bookingScheduleId:
          finalData.bookingScheduleId != null
            ? Number(finalData.bookingScheduleId)
            : null,
        bookingAmount: finalData.bookingAmount as never,
        status: (finalData.status as typeof TRANSACTION_COMPLETED) ?? TRANSACTION_COMPLETED,
      },
    });

    await this.syncUserTotalTransaction(Number(finalData.userId));

    return created as unknown as ExtendedTransaction;
  }

  /** Set user.total_transaction to sum of transaction.booking_amount for that user. */
  protected async syncUserTotalTransaction(userId: number): Promise<void> {
    const { _sum } = await prisma.transaction.aggregate({
      where: { userId },
      _sum: { bookingAmount: true },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { totalTransaction: _sum.bookingAmount ?? 0 },
    });
  }
}
