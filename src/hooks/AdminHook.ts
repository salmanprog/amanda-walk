import { Prisma, UserType } from "@prisma/client";
import { getHookUser } from "@/utils/hookUser";

export default class AdminHook {

  static async indexQueryHook(
    query: Prisma.UserFindManyArgs,
    request?: Record<string, unknown>
  ): Promise<Prisma.UserFindManyArgs> {
    const user = getHookUser(request);
    query.include = {
      userRole: {
        include: {
          modulePermissions: {
            include: {
              cmsModule: {
                include: {
                  parent: true,
                  children: true,
                },
              },
            },
          },
        },
      },
      apiTokens: true,
    };
    query.where = { ...query.where, deletedAt: null };
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
    console.log("🔍 AdminHook.showQueryHook called");
    query.include = {
      userRole: {
        include: {
          modulePermissions: {
            include: {
              cmsModule: {
                include: {
                  parent: true,
                  children: true,
                },
              },
            },
          },
        },
      },
      apiTokens: true,
    };
    query.where = { ...query.where, deletedAt: null };
    
    console.log("🔍 showQueryHook include structure:", JSON.stringify(query.include, null, 2));

    return query;
  }

  static async beforeCreateHook(
  data: Prisma.UserCreateInput & { userGroupId?: number }
): Promise<Prisma.UserCreateInput & { userGroupId?: number }> { 
   data.userGroupId = 2;
    return data;
  }
}
