import { Prisma, UserType } from "@prisma/client";
import { getHookUser } from "@/utils/hookUser";

export default class EmployeeHook {

  static async indexQueryHook(  
    query: Prisma.ServicesFindManyArgs,
    request?: Record<string, unknown>
  ): Promise<Prisma.ServicesFindManyArgs> {
    const user = getHookUser(request);
    query.include = {
      user: true,
    };
    query.where = { ...query.where, deletedAt: null };
    if (user && user.id) {
      query.where = { ...query.where, id: { not: Number(user.id) } };
    }
    if (request && typeof request.q === "string") {
      query.where = {
        ...query.where,
        title: {
          contains: request.q,
          mode: "insensitive",
        } as Prisma.StringFilter,
      };
    }

    return query;
  }

  static async showQueryHook(
  query: Prisma.ServicesFindUniqueArgs,
  request?: Record<string, unknown>
  ): Promise<Prisma.ServicesFindUniqueArgs> {
    query.include = {
      user: true,
    };
    query.where = { ...query.where, deletedAt: null };

    return query;
  }

  static async beforeCreateHook(
    data: Prisma.ServicesCreateInput,
    request?: Record<string, unknown>
): Promise<Prisma.ServicesCreateInput> { 
    return data;
  }
}
