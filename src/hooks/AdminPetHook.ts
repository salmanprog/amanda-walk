import { Prisma } from "@prisma/client";
import { getHookUser } from "@/utils/hookUser";

export default class AdminPetHook {

  // For listing multiple pets
  static async indexQueryHook(
    query: any,
    request?: Record<string, unknown>
  ): Promise<any> {
    const user = getHookUser(request);
    if(user?.userGroupId !== 1) {
      query.where = { ...query.where, userId: user?.id };
    }
    query.where = { ...query.where, deletedAt: null };
    query.orderBy = {
      createdAt: "desc",
    };
    return query;
  }

  // For fetching a single pet by id or slug
  static async showQueryHook(
    query: any,
    request?: Record<string, unknown>
  ): Promise<any> {
    query.where = { ...query.where, deletedAt: null };
    return query;
  }

  // Before creating a new pet
  static async beforeCreateHook(
    data: any
  ): Promise<any> {
    return data;
  }
}

