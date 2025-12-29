import { Prisma } from "@prisma/client";

export default class AdminPetTypeHook {

  // For listing multiple pet types
  static async indexQueryHook(
    query: any,
    request?: Record<string, unknown>
  ): Promise<any> {
    query.where = { ...query.where, deletedAt: null };
    query.orderBy = {
      createdAt: "desc",
    };
    return query;
  }

  // For fetching a single pet type by id or slug
  static async showQueryHook(
    query: any,
    request?: Record<string, unknown>
  ): Promise<any> {
    query.where = { ...query.where, deletedAt: null };
    return query;
  }

  // Before creating a new pet type
  static async beforeCreateHook(
    data: any
  ): Promise<any> {
    return data;
  }
}

