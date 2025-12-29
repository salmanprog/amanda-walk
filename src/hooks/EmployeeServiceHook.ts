import { Prisma, UserType } from "@prisma/client";
import { getHookUser } from "@/utils/hookUser";

export default class EmployeeHook {

  static async indexQueryHook(  
    query: Prisma.EmployeeServicesFindManyArgs,
    request?: Record<string, unknown>
  ): Promise<Prisma.EmployeeServicesFindManyArgs> {
    const user = getHookUser(request);
    query.include = {
      user: true,
    };
    query.where = { ...query.where, deletedAt: null };
    // if (user && user.id) {
    //   query.where = { ...query.where, id: { not: Number(user.id) } };
    // }
    if (request && typeof request.q === "string") {
      query.where = {
        ...query.where,
        serviceTitle: {
          contains: request.q,
          mode: "insensitive",
        } as Prisma.StringFilter,
      };
    }
    // Filter by CategoryId if provided in query parameters
    if (request?.query && typeof request.query === 'object' && 'cat_id' in request.query) {    
      const cat_id = request.query.cat_id;
      if (cat_id) {
        query.where = { 
          ...query.where,     
          serviceCategoryId: typeof cat_id === 'string' ? parseInt(cat_id, 10) : Number(cat_id)
        };
      }
    }
    if (request?.query && typeof request.query === 'object' && 'service_id' in request.query) {    
      const service_id = request.query.service_id;
      if (service_id) {
        query.where = { 
          ...query.where,     
          serviceId: typeof service_id === 'string' ? parseInt(service_id, 10) : Number(service_id)
        };
      }
    }

    return query;
  }

  static async showQueryHook(
  query: Prisma.EmployeeServicesFindUniqueArgs,
  request?: Record<string, unknown>
  ): Promise<Prisma.EmployeeServicesFindUniqueArgs> {
    query.include = {
      user: true,
    };
    query.where = { ...query.where, deletedAt: null };

    return query;
  }

  static async beforeCreateHook(
    data: Prisma.EmployeeServicesCreateInput,
    request?: Record<string, unknown>
): Promise<Prisma.EmployeeServicesCreateInput> { 
    return data;
  }
}
