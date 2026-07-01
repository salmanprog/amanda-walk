import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import { NextResponse } from "next/server";
import AdminInvoiceHook from "@/hooks/AdminInvoiceHook";
import AdminInvoiceResource, {
  type ExtendedInvoice,
} from "@/resources/AdminInvoiceResource";
import { storeInvoice, updateAdminInvoice } from "@/validators/user.validation";

export default class AdminInvoiceController extends RestController<
  typeof prisma.invoice,
  ExtendedInvoice
> {
  constructor(req?: Request, data?: Partial<ExtendedInvoice & { invoiceAmount?: number }>) {
    super(prisma.invoice as never, req);
    this.data = data ?? {};
    this.resource = AdminInvoiceResource;
    this.hook = AdminInvoiceHook;
  }

  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storeInvoice, this.data ?? {});
      case "update":
        return await this.__validate(updateAdminInvoice, this.data ?? {});
    }
  }

  protected async beforeUpdate(): Promise<void | NextResponse> {
    if (!this.data) this.data = {};
    const isPaid = Boolean(this.data.isPaid);
    for (const key of Object.keys(this.data)) {
      delete (this.data as Record<string, unknown>)[key];
    }
    Object.assign(this.data, { isPaid });
  }

  protected async afterUpdate(record: ExtendedInvoice): Promise<ExtendedInvoice> {
    const userId = Number(record.userId);

    const aggregate = await prisma.invoice.aggregate({
      where: {
        userId,
        isPaid: true,
      },
      _sum: {
        invoiceAmount: true,
      },
    });

    const payTransaction = Number(aggregate._sum.invoiceAmount ?? 0);

    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: { totalTransaction: true },
    });

    if (user) {
      const totalTransaction = Number(user.totalTransaction ?? 0);
      const remainingTransaction = totalTransaction - payTransaction;

      await prisma.user.update({
        where: { id: userId },
        data: {
          payTransaction,
          remainingTransaction,
        },
      });
    }

    return record;
  }

  protected async beforeStore(): Promise<void | NextResponse> {
    const userId = Number(this.data?.userId);
    const invoiceAmount = Number((this.data as { invoiceAmount?: number })?.invoiceAmount);

    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: { id: true, remainingTransaction: true },
    });

    if (!user) {
      return this.sendError("Validation failed", { userId: "User not found" }, 404);
    }

    const unpaidInvoice = await prisma.invoice.findFirst({
      where: {
        userId,
        isPaid: false,
      },
    });

    if (unpaidInvoice) {
      return this.sendError(
        "Validation failed",
        {
          invoice:
            "Already previous invoice is unpaid. First you need to pay the generated invoice.",
        },
        422
      );
    }

    const remaining = Number(user.remainingTransaction ?? 0);
    if (invoiceAmount > remaining) {
      return this.sendError(
        "Validation failed",
        { invoiceAmount: "Invoice amount cannot be greater than remaining balance" },
        422
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!this.data) this.data = {};
    Object.assign(this.data, {
      userId,
      invoiceAmount,
      invoiceDate: today,
      isPaid: false,
    });
  }
}
