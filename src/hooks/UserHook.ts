import { Prisma, UserType } from "@prisma/client";
import { getHookUser } from "@/utils/hookUser";
import { prisma } from "@/lib/prisma";

export default class UserHook {

  static async indexQueryHook(
    query: Prisma.UserFindManyArgs,
    request?: Record<string, unknown>
  ): Promise<Prisma.UserFindManyArgs> {
    const user = getHookUser(request);
    query.include = {
      userRole: true,
      apiTokens: true,
    };
    if(request && (request?.query as any)?.group_id) {
      query.where = { ...query.where, deletedAt: null,userGroupId: Number((request?.query as any)?.group_id) };
    }else{
      query.where = { ...query.where, deletedAt: null,userGroupId: 2 };
    }
    if (user && user.id) {
      query.where = { ...query.where, id: { not: Number(user.id) } };
    }
    if (request && typeof request.q === "string") {
      query.where = {
        ...query.where,
        name: {
          contains: request.q,
          mode: "insensitive",
        } as Prisma.StringFilter,
      };
    }

    if (request && typeof request.userType === "string") {
        query.where = {
            ...query.where,
            userType: request.userType as UserType,
        };
    }
    return query;
  }

  static async showQueryHook(
  query: Prisma.UserFindUniqueArgs,
  request?: Record<string, unknown>
  ): Promise<Prisma.UserFindUniqueArgs> {
    query.include = {
      userRole: true,
      apiTokens: true,
    };
    query.where = { ...query.where, deletedAt: null};
    //query.where = { ...query.where, deletedAt: null,userGroupId: 2 };

    return query;
  }

  static async beforeCreateHook(
    data: Prisma.UserCreateInput & { userGroupId?: number },
    request?: Record<string, unknown>
  ): Promise<Prisma.UserCreateInput & { userGroupId?: number }> {
    data.userGroupId = 2;

    const q = request?.query as Record<string, unknown> | undefined;
    const raw = q?.refSlug ?? q?.slug;
    const refSlug =
      typeof raw === "string"
        ? raw.trim()
        : Array.isArray(raw)
          ? String(raw[0] ?? "").trim()
          : "";

    if (refSlug) {
      const link = await (prisma as unknown as {
        generate_signup_links: { findFirst: (args: object) => Promise<{ id: number } | null> };
      }).generate_signup_links.findFirst({
        where: {
          slug: refSlug,
          deletedAt: null,
          status: true,
        },
        select: { id: true },
      });
      data.status = Boolean(link);
    } else {
      data.status = false;
    }

    return data;
  }
}
