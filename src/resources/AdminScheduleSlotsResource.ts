import BaseResource from "@/resources/BaseResource";
import type { ScheduleSlots } from "@prisma/client";

export type ExtendedScheduleSlot = ScheduleSlots;

export default class AdminScheduleSlotsResource extends BaseResource<ExtendedScheduleSlot> {
  async toArray(slot: ExtendedScheduleSlot): Promise<Record<string, unknown>> {
    return {
      id: slot.id,
      slug: slot.slug,
      startTime: slot.startTime,
      startAmPM: slot.startAmPM,
      endTime: slot.endTime,
      endAmPM: slot.endAmPM,
      status: slot.status,
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt,
    };
  }

  async collection(
    records: ExtendedScheduleSlot[]
  ): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map((r) => this.toArray(r)));
  }
}
