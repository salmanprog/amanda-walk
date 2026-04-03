import BaseResource from "@/resources/BaseResource";
import type { ScheduleSlots } from "@prisma/client";
import { formatScheduleSlotLabel } from "@/utils/scheduleSlotLabel";

export default class UsersScheduleSlotsResource extends BaseResource<ScheduleSlots> {
  async toArray(slot: ScheduleSlots): Promise<Record<string, unknown>> {
    return {
      id: slot.id,
      slug: slot.slug,
      startTime: slot.startTime,
      startAmPM: slot.startAmPM,
      endTime: slot.endTime,
      endAmPM: slot.endAmPM,
      label: formatScheduleSlotLabel(slot),
    };
  }

  async collection(records: ScheduleSlots[]): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map((r) => this.toArray(r)));
  }
}
