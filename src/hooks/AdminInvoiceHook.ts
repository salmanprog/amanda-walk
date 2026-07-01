import { Prisma } from "@prisma/client";

export default class AdminInvoiceHook {
  static async indexQueryHook(
    query: Prisma.InvoiceFindManyArgs
  ): Promise<Prisma.InvoiceFindManyArgs> {
    query.include = {
      user: {
        select: { id: true, name: true, email: true },
      },
    };
    query.orderBy = { createdAt: "desc" };
    return query;
  }

  static async showQueryHook(
    query: Prisma.InvoiceFindUniqueArgs
  ): Promise<Prisma.InvoiceFindUniqueArgs> {
    return query;
  }

  static async beforeCreateHook(
    data: Prisma.InvoiceCreateInput & {
      userId?: number;
      invoiceDate?: Date;
      isPaid?: boolean;
    }
  ): Promise<Prisma.InvoiceCreateInput & { userId?: number }> {
    if (data.isPaid === undefined) {
      data.isPaid = false;
    }
    if (!data.invoiceDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      data.invoiceDate = today;
    }
    return data;
  }
}
