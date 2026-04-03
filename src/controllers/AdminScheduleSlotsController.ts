import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import { NextResponse } from "next/server";
import AdminScheduleSlotsHook from "@/hooks/AdminScheduleSlotsHook";
import AdminScheduleSlotsResource, {
  type ExtendedScheduleSlot,
} from "@/resources/AdminScheduleSlotsResource";
import { storeScheduleSlot, updateScheduleSlot } from "@/validators/user.validation";
import { generateSlug } from "@/utils/slug";

export default class AdminScheduleSlotsController extends RestController<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  ExtendedScheduleSlot
> {
  constructor(req?: Request, data?: Partial<ExtendedScheduleSlot>) {
    super((prisma as any).scheduleSlots as any, req);

    this.data = data ?? {};
    this.resource = AdminScheduleSlotsResource;
    this.hook = AdminScheduleSlotsHook;
  }

  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storeScheduleSlot, this.data ?? {});
      case "update":
        return await this.__validate(updateScheduleSlot, this.data ?? {});
    }
  }

  protected async beforeIndex(): Promise<void | NextResponse> {
    this.getCurrentUser();
  }

  protected async beforeStore(): Promise<void | NextResponse> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
    if (this.data?.status !== undefined) {
      const s = this.data.status;
      this.data.status = s === true || String(s) === "1";
    }

    const st = this.data?.startTime;
    const sam = this.data?.startAmPM;
    const et = this.data?.endTime;
    const eam = this.data?.endAmPM;
    if (this.data && st && sam && et && eam) {
      const label = `${String(st)}-${String(sam)}-${String(et)}-${String(eam)}`;
      this.data.slug = await generateSlug("scheduleSlots" as keyof typeof prisma, label);
    }
  }

  protected async afterStore(record: ExtendedScheduleSlot): Promise<ExtendedScheduleSlot> {
    return record;
  }

  protected async beforeUpdate(): Promise<void | NextResponse> {
    if (this.data?.status !== undefined) {
      const s = this.data.status;
      this.data.status = s === true || String(s) === "1";
    }
  }

  protected async afterUpdate(record: ExtendedScheduleSlot): Promise<ExtendedScheduleSlot> {
    return record;
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    const currentUser = this.requireUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
  }
}
