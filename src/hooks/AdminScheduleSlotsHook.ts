import { Prisma } from "@prisma/client";

export default class AdminScheduleSlotsHook {
  static async indexQueryHook(
    query: Prisma.ScheduleSlotsFindManyArgs,
    request?: Record<string, unknown>
  ): Promise<Prisma.ScheduleSlotsFindManyArgs> {
    query.where = { ...query.where, deletedAt: null };
    query.orderBy = { id: "asc" };
    return query;
  }

  static async showQueryHook(
    query: Prisma.ScheduleSlotsFindUniqueArgs,
    request?: Record<string, unknown>
  ): Promise<Prisma.ScheduleSlotsFindUniqueArgs> {
    query.where = { ...query.where, deletedAt: null };
    return query;
  }

  static async beforeCreateHook(
    data: Prisma.ScheduleSlotsCreateInput
  ): Promise<Prisma.ScheduleSlotsCreateInput> {
    return data;
  }
}
