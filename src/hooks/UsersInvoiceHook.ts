import { Prisma } from "@prisma/client";
import { getHookUser } from "@/utils/hookUser";

export default class UsersInvoiceHook {
  static async indexQueryHook(
    query: Prisma.InvoiceFindManyArgs,
    request?: Record<string, unknown>
  ): Promise<Prisma.InvoiceFindManyArgs> {
    const user = getHookUser(request);
    if (user?.id) {
      query.where = { ...query.where, userId: Number(user.id) };
    }
    query.orderBy = { createdAt: "desc" };
    return query;
  }
}
