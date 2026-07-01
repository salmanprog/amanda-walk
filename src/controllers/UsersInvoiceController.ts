import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import { NextResponse } from "next/server";
import UsersInvoiceHook from "@/hooks/UsersInvoiceHook";
import AdminInvoiceResource, {
  type ExtendedInvoice,
} from "@/resources/AdminInvoiceResource";
import { updateUserInvoice } from "@/validators/user.validation";

export default class UsersInvoiceController extends RestController<
  typeof prisma.invoice,
  ExtendedInvoice
> {
  private invoiceId: number | null = null;

  constructor(req?: Request, data?: Partial<ExtendedInvoice>) {
    super(prisma.invoice as never, req);
    this.data = data ?? {};
    this.resource = AdminInvoiceResource;
    this.hook = UsersInvoiceHook;
  }

  setInvoiceId(id: number) {
    this.invoiceId = id;
  }

  protected async validation(action: string) {
    switch (action) {
      case "update":
        return await this.__validate(updateUserInvoice, this.data ?? {});
    }
  }

  protected async beforeUpdate(): Promise<void | NextResponse> {
    const user = this.getCurrentUser();
    const invoiceId = this.invoiceId;

    if (!user?.id || !invoiceId) {
      return this.sendError("Validation failed", { authorization: "Unauthorized" }, 401);
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: Number(user.id),
      },
    });

    if (!invoice) {
      return this.sendError("Validation failed", { invoice: "Invoice not found" }, 404);
    }

    if (invoice.userPaid === 1) {
      return this.sendError(
        "Validation failed",
        { invoice: "Payment has already been submitted for this invoice." },
        422
      );
    }

    if (!this.data) this.data = {};
    Object.assign(this.data, { userPaid: 1 });
  }
}
