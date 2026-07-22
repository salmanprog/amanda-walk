import BaseResource from "@/resources/BaseResource";
import type { Invoice } from "@prisma/client";

export type ExtendedInvoice = Invoice & {
  user?: {
    id: number;
    name: string | null;
    email: string | null;
  } | null;
};

export default class AdminInvoiceResource extends BaseResource<ExtendedInvoice> {
  async toArray(record: ExtendedInvoice): Promise<Record<string, unknown>> {
    return {
      id: record.id,
      userId: record.userId,
      userName: record.user?.name ?? null,
      userEmail: record.user?.email ?? null,
      invoiceDate: record.invoiceDate,
      invoiceAmount:
        record.invoiceAmount != null ? Number(record.invoiceAmount) : 0,
      isPaid: record.isPaid,
      userPaid: record.userPaid,
      modeOfPayment: record.modeOfPayment ?? null,
      transactionId: record.transactionId ?? null,
      comments: record.comments ?? null,
      attachments: record.attachments ?? null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
