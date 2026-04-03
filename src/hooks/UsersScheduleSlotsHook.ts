import { Prisma } from "@prisma/client";

export default class UsersScheduleSlotsHook {
  static async indexQueryHook(
    query: Prisma.ScheduleSlotsFindManyArgs,
    _request?: Record<string, unknown>
  ): Promise<Prisma.ScheduleSlotsFindManyArgs> {
    query.where = {
      ...query.where,
      deletedAt: null,
      status: true,
    };
    query.orderBy = { id: "asc" };
    return query;
  }
}
