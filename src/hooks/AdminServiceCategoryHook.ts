import { Prisma } from "@prisma/client";
import { getHookUser } from "@/utils/hookUser";

export default class AdminServiceCategoryHook {

  // For listing multiple blogs
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

  // For fetching a single blog by id or slug
  static async showQueryHook(
    query: any,
    request?: Record<string, unknown>
  ): Promise<any> {
    query.where = { ...query.where, deletedAt: null };
    return query;
  }

  // Before creating a new blog
  static async beforeCreateHook(
    data: any
  ): Promise<any> {
    return data;
  }
}

