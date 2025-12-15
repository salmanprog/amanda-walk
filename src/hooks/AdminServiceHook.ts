import { Prisma } from "@prisma/client";
import { getHookUser } from "@/utils/hookUser";

export default class AdminServiceHook {

  // For listing multiple blogs
  static async indexQueryHook(
    query: any,
    request?: Record<string, unknown>
  ): Promise<any> {
    query.include = {
      user: true,
      category: true,
    };
    query.where = { ...query.where, deletedAt: null };
    if (request?.query && typeof request.query === 'object' && 'cat_id' in request.query) {    
      const cat_id = request.query.cat_id;
      if (cat_id) {
        query.where = { 
          ...query.where,     
          servicesCategoryId: typeof cat_id === 'string' ? parseInt(cat_id, 10) : Number(cat_id)
        };
      }
    }
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
    query.include = {
      user: true,
      category: true,
    };
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

