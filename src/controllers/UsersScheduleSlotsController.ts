import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import UsersScheduleSlotsHook from "@/hooks/UsersScheduleSlotsHook";
import UsersScheduleSlotsResource from "@/resources/UsersScheduleSlotsResource";
import type { ScheduleSlots } from "@prisma/client";

export default class UsersScheduleSlotsController extends RestController<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  ScheduleSlots
> {
  constructor(req?: Request) {
    super((prisma as any).scheduleSlots as any, req);

    this.data = {};
    this.resource = UsersScheduleSlotsResource;
    this.hook = UsersScheduleSlotsHook;
  }

  protected async beforeIndex(): Promise<void> {
    return;
  }
}
