/** Display label for a schedule slot row (scheduleslots table shape). */
export function formatScheduleSlotLabel(slot: {
  startTime: string;
  startAmPM: string;
  endTime: string;
  endAmPM: string;
}): string {
  const start = `${String(slot.startTime).padStart(2, "0")}:00 ${slot.startAmPM}`;
  const end = `${String(slot.endTime).padStart(2, "0")}:00 ${slot.endAmPM}`;
  return `${start} - ${end}`;
}
