"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import Button from "@/components/ui/button/Button";
import useApi from "@/utils/useApi";
import Badge from "@/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

function displayServiceMints(booking: unknown): string {
  if (booking == null || typeof booking !== "object") return "—";
  const b = booking as Record<string, unknown>;
  const nested =
    b.service != null && typeof b.service === "object" && "mints" in b.service
      ? (b.service as { mints?: unknown }).mints
      : undefined;
  const raw = b.serviceMints ?? b.service_mints ?? nested;
  const s = raw != null ? String(raw).trim() : "";
  return s !== "" ? s : "—";
}

function parseMintsMinutesFromBooking(booking: unknown): number | null {
  const label = displayServiceMints(booking);
  if (label === "—") return null;
  const m = label.match(/\d+/);
  if (!m) return null;
  const n = parseInt(m[0], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function formatSlotTime(d: Date): string {
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function parseTimeToToday(fragment: string): Date | null {
  const ref = new Date();
  ref.setHours(0, 0, 0, 0);
  const t = fragment.trim();
  const m12 = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (m12) {
    let h = parseInt(m12[1], 10);
    const min = m12[2] ? parseInt(m12[2], 10) : 0;
    const ap = m12[3].toUpperCase();
    if (ap === "PM" && h !== 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
    if (h > 23 || min > 59) return null;
    const d = new Date(ref);
    d.setHours(h, min, 0, 0);
    return d;
  }
  const m24 = t.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    const h = parseInt(m24[1], 10);
    const min = parseInt(m24[2], 10);
    if (h > 23 || min > 59) return null;
    const d = new Date(ref);
    d.setHours(h, min, 0, 0);
    return d;
  }
  return null;
}

function parseTimeRange(scheduleTime: string): { start: Date; end: Date } | null {
  const m = scheduleTime.trim().match(/^(.+?)\s*[-–—]\s*(.+)$/);
  if (!m) return null;
  const start = parseTimeToToday(m[1].trim());
  const end = parseTimeToToday(m[2].trim());
  if (!start || !end) return null;
  const endAdj = new Date(end.getTime());
  if (endAdj <= start) endAdj.setDate(endAdj.getDate() + 1);
  return { start, end: endAdj };
}

function buildSubSlots(start: Date, end: Date, stepMinutes: number): string[] {
  const out: string[] = [];
  const stepMs = stepMinutes * 60 * 1000;
  let cur = new Date(start.getTime());
  const endMs = end.getTime();
  while (cur.getTime() < endMs) {
    const next = new Date(cur.getTime() + stepMs);
    if (next.getTime() > endMs) break;
    out.push(`${formatSlotTime(cur)} - ${formatSlotTime(next)}`);
    cur = next;
  }
  return out;
}

/** Map DB `scheduleSlot` (may be truncated) to the exact `lines[]` label for radios. */
function matchSavedSlotToLine(
  saved: string | null | undefined,
  lines: string[]
): string | null {
  if (saved == null || lines.length === 0) return null;
  const s = String(saved).trim();
  if (!s) return null;
  if (lines.includes(s)) return s;
  const compact = (x: string) => x.replace(/\s+/g, "").toLowerCase();
  const sc = compact(s);
  const byCompact = lines.find((line) => compact(line) === sc);
  if (byCompact) return byCompact;
  const byPrefix = lines.find((line) => line.startsWith(s));
  if (byPrefix) return byPrefix;
  return null;
}

interface ScheduleRow {
  id?: number;
  employeeId?: number;
  scheduleDate?: string | Date | null;
  scheduleTime?: string | null;
  scheduleSlot?: string | null;
  isStarted?: boolean;
  isCompleted?: boolean;
}

export default function EditBookingStatus() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [status, setStatus] = useState<string>("PENDING");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [selectedSubSlot, setSelectedSubSlot] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { data: bookingData, fetchApi: fetchBooking, loading: loadingBooking } = useApi({
    url: `/api/users/booking/${id}`,
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  const { sendData, loading: saving } = useApi({
    url: `/api/users/booking/${id}`,
    method: "PATCH",
    type: "manual",
    requiresAuth: true,
  });

  const { data: employeesData, fetchApi: fetchEmployees } = useApi({
    url: "/api/admin/employee",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  const employees = Array.isArray(employeesData) ? employeesData : [];

  useEffect(() => {
    document.title = "Admin | Edit Booking Status";
  }, []);

  useEffect(() => {
    if (id) fetchBooking();
    fetchEmployees();
  }, [id]);

  useEffect(() => {
    if (bookingData?.status) setStatus(bookingData.status);
    if (bookingData?.assignedTo != null) setAssignedTo(String(bookingData.assignedTo));
  }, [bookingData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    const payload: {
      status: string;
      assignedTo?: number | null;
      scheduleSlot?: string | null;
    } = { status };
    payload.assignedTo = assignedTo === "" ? null : Number(assignedTo);
    if (
      assignedTo !== "" &&
      !Number.isNaN(Number(assignedTo)) &&
      selectedSubSlot != null
    ) {
      payload.scheduleSlot = selectedSubSlot.slice(0, 20);
    }
    try {
      const res = await sendData(payload, undefined, "PATCH");
      if (res?.code === 200) {
        setSuccessMsg("Booking status updated successfully.");
        if (res?.data?.status) setStatus(res.data.status);
        if (res?.data?.assignedTo != null) setAssignedTo(String(res.data.assignedTo));
        else if (res?.data?.assignedTo === null) setAssignedTo("");
        await fetchBooking();
      } else {
        setErrorMsg(res?.message || "Update failed.");
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || "Update failed. Try again.");
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "PENDING": return "warning";
      case "CONFIRMED":
      case "COMPLETED": return "success";
      case "CANCELLED": return "error";
      default: return "warning";
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateStr: string | Date | null | undefined) => {
    if (dateStr == null) return "—";
    const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const scheduleRows = useMemo((): ScheduleRow[] => {
    if (!bookingData) return [];
    const withSchedules = bookingData as { schedules?: ScheduleRow[] };
    if (
      Array.isArray(withSchedules.schedules) &&
      withSchedules.schedules.length > 0
    ) {
      return withSchedules.schedules;
    }
    if (
      bookingData.scheduleDate != null ||
      bookingData.scheduleTime != null
    ) {
      return [
        {
          employeeId:
            bookingData.assignedTo != null
              ? Number(bookingData.assignedTo)
              : undefined,
          scheduleDate: bookingData.scheduleDate ?? null,
          scheduleTime: bookingData.scheduleTime ?? null,
          isStarted: bookingData.isStarted ?? false,
          isCompleted: bookingData.isCompleted ?? false,
        },
      ];
    }
    return [];
  }, [bookingData]);

  const selectedEmployeeScheduleDisplay = useMemo(() => {
    if (assignedTo === "" || Number.isNaN(Number(assignedTo))) {
      return { kind: "none" as const };
    }
    const empId = Number(assignedTo);
    const rowEmpId = (r: ScheduleRow) =>
      r.employeeId == null ? NaN : Number(r.employeeId);
    let times = scheduleRows
      .filter((r) => rowEmpId(r) === empId)
      .map((r) => r.scheduleTime)
      .filter((t) => t != null && String(t).trim() !== "")
      .map(String);
    if (times.length === 0 && scheduleRows.length === 1) {
      const t = scheduleRows[0].scheduleTime;
      if (t != null && String(t).trim() !== "") times = [String(t)];
    }
    if (
      times.length === 0 &&
      bookingData?.scheduleTime != null &&
      String(bookingData.scheduleTime).trim() !== ""
    ) {
      times = [String(bookingData.scheduleTime)];
    }
    const fallbackText = times.length > 0 ? times.join(", ") : "—";
    if (fallbackText === "—") {
      return { kind: "plain" as const, text: "—" };
    }
    const step = parseMintsMinutesFromBooking(bookingData);
    if (step != null) {
      const lines: string[] = [];
      for (const timeStr of times) {
        const range = parseTimeRange(timeStr);
        if (!range) continue;
        lines.push(...buildSubSlots(range.start, range.end, step));
      }
      if (lines.length > 0) {
        return { kind: "slots" as const, lines };
      }
    }
    return { kind: "plain" as const, text: fallbackText };
  }, [assignedTo, scheduleRows, bookingData]);

  useEffect(() => {
    if (selectedEmployeeScheduleDisplay.kind !== "slots") {
      setSelectedSubSlot(null);
      return;
    }
    const lines = selectedEmployeeScheduleDisplay.lines;
    const dbSlot = scheduleRows
      .map((r) => r.scheduleSlot)
      .find((x) => x != null && String(x).trim() !== "");
    const fromDb = matchSavedSlotToLine(dbSlot, lines);
    setSelectedSubSlot((prev) => {
      if (fromDb) return fromDb;
      if (prev != null && lines.includes(prev)) return prev;
      return lines[0] ?? null;
    });
  }, [selectedEmployeeScheduleDisplay, scheduleRows, assignedTo]);

  if (loadingBooking && !bookingData) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800">
        <p className="text-gray-500">Loading booking...</p>
      </div>
    );
  }

  if (!bookingData && !loadingBooking) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800">
        <p className="text-gray-500">Booking not found.</p>
        <Button className="mt-4" variant="secondary" onClick={() => router.push("/admin/booking")}>
          Back to list
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Edit Booking Status</h3>
          <p className="mt-1 text-sm text-gray-500">Booking #{bookingData?.id}</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(`/admin/chat?bookingId=${bookingData?.id ?? id}`)}
          className="inline-flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Chat
        </Button>
      </div>

      <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/30">
        <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Booking details</h4>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">User name</dt>
            <dd className="font-medium text-gray-800 dark:text-white">{bookingData?.userName ?? bookingData?.userId ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium text-gray-800 dark:text-white">{bookingData?.userEmail ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Phone</dt>
            <dd className="font-medium text-gray-800 dark:text-white">{bookingData?.userPhone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Category / Service</dt>
            <dd className="font-medium text-gray-800 dark:text-white">{bookingData?.categoryName ?? "—"} / {bookingData?.serviceName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Service Duration</dt>
            <dd className="font-medium text-gray-800 dark:text-white">
              {displayServiceMints(bookingData)}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Total</dt>
            <dd className="font-medium text-gray-800 dark:text-white">${Number(bookingData?.totalPrice ?? 0).toFixed(2)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Schedule</dt>
            <dd className="font-medium text-gray-800 dark:text-white">
              {bookingData?.scheduleSlot != null &&
                    String(bookingData.scheduleSlot).trim() !== ""
                      ? String(bookingData.scheduleSlot).trim()
                      : (bookingData.scheduleTime ?? "—")}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="mb-1.5 text-gray-500">Assigned employee</dt>
            <dd>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="">— Select employee —</option>
                {employees.map((emp: { id: number; name?: string | null; email?: string | null }) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name ?? emp.email ?? `Employee #${emp.id}`}
                  </option>
                ))}
              </select>
              {assignedTo !== "" && !Number.isNaN(Number(assignedTo)) && (
                <div className="mt-2 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900/40">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Schedule time slots
                  </p>
                  {selectedEmployeeScheduleDisplay.kind === "slots" ? (
                    <div
                      className="mt-0.5 space-y-2 text-sm text-gray-800 dark:text-white"
                      role="radiogroup"
                      aria-label="Choose one schedule slot"
                    >
                      {selectedEmployeeScheduleDisplay.lines.map((line, i) => (
                        <label
                          key={`${line}-${i}`}
                          className="flex cursor-pointer items-start gap-2 font-medium"
                        >
                          <input
                            type="radio"
                            name={`sub-slot-${id}`}
                            value={line}
                            checked={selectedSubSlot === line}
                            onChange={() => setSelectedSubSlot(line)}
                            className="mt-0.5 h-4 w-4 shrink-0 border-gray-300 text-indigo-600 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800"
                          />
                          <span className="leading-snug">{line}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {selectedEmployeeScheduleDisplay.kind === "plain"
                        ? selectedEmployeeScheduleDisplay.text
                        : "—"}
                    </p>
                  )}
                </div>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Current status</dt>
            <dd>
              <Badge size="sm" color={statusColor(bookingData?.status ?? "PENDING")}>
                {bookingData?.status ?? "PENDING"}
              </Badge>
            </dd>
          </div>
        </dl>
      </div>

      {/* Booking schedules from same API response */}
      <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/30">
        <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          Booking schedules
        </h4>
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Schedule date
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Schedule time
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Started
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Completed
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {scheduleRows.length > 0 ? (
                scheduleRows.map((row: ScheduleRow, idx: number) => (
                  <TableRow key={row.id ?? idx}>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {row.scheduleDate ? formatDateOnly(row.scheduleDate) : "—"}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {row.scheduleSlot != null &&
                    String(row.scheduleSlot).trim() !== ""
                      ? String(row.scheduleSlot).trim()
                      : (row.scheduleTime ?? "—")}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {!!row.isStarted ? "Yes" : "No"}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {!!row.isCompleted ? "Yes" : "No"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-6 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                  >
                    No schedule entries.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {errorMsg && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
        )}
        {successMsg && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">{successMsg}</p>
        )}

        <div className="mt-6 flex gap-3">
          <Button type="submit" loading={saving}>
            Save status
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/admin/booking")}
          >
            Back to list
          </Button>
        </div>
      </form>
    </div>
  );
}
