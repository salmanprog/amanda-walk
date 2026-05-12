"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import Button from "@/components/ui/button/Button";
import useApi from "@/utils/useApi";
import Badge from "@/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { displayPetColor } from "@/lib/petColorLabels";

const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

function isUnsetDisplay(s: string): boolean {
  const t = s.trim();
  return t === "" || t === "—" || t === "-" || t === "–";
}

/** Registration / profile: first matching key wins (`null`/empty/placeholder → try next → em dash). */
function registrationField(booking: unknown, ...keys: string[]): string {
  if (booking == null || typeof booking !== "object") return "—";
  const b = booking as Record<string, unknown>;
  for (const key of keys) {
    const raw = b[key];
    if (raw == null) continue;
    const s = String(raw).trim();
    if (!isUnsetDisplay(s)) return s;
  }
  return "—";
}

function registrationDisplayName(booking: unknown): string {
  const n = registrationField(booking, "userName", "name");
  if (!isUnsetDisplay(n)) return n;
  if (booking != null && typeof booking === "object" && "userId" in booking) {
    const uid = (booking as { userId?: unknown }).userId;
    if (uid != null && String(uid).trim() !== "") return `User #${String(uid)}`;
  }
  return "—";
}

/** Single-line address: API `registrationAddressLine` or stitched parts (street, city, state, postal, country). */
function registrationCombinedAddress(booking: unknown): string {
  const line = registrationField(booking, "registrationAddressLine", "fullAddress");
  if (!isUnsetDisplay(line)) return line;
  if (booking == null || typeof booking !== "object") return "—";
  const b = booking as Record<string, unknown>;
  const parts = ["streetAddress", "city", "state", "postalCode", "country"].map((k) => {
    const raw = b[k];
    if (raw == null) return "";
    const s = String(raw).trim();
    return isUnsetDisplay(s) ? "" : s;
  }).filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
}

/** `bookings.assignedTo`: null / missing / 0 → no employee assigned. */
function bookingHasAssignedEmployee(booking: unknown): boolean {
  if (booking == null || typeof booking !== "object") return false;
  const a = (booking as { assignedTo?: unknown }).assignedTo;
  if (a == null) return false;
  const n = Number(a);
  return Number.isFinite(n) && !Number.isNaN(n) && n > 0;
}

function assignedEmployeeDisplayName(booking: unknown): string {
  const flat = registrationField(
    booking,
    "assignedEmployeeName",
    "employeeName"
  );
  if (!isUnsetDisplay(flat)) return flat;
  if (booking != null && typeof booking === "object" && "assignedUser" in booking) {
    const au = (booking as { assignedUser?: { name?: string | null; lname?: string | null } })
      .assignedUser;
    if (au) {
      const n = [au.name, au.lname].filter(Boolean).join(" ").trim();
      if (n !== "" && !isUnsetDisplay(n)) return n;
    }
  }
  if (booking != null && typeof booking === "object" && "assignedTo" in booking) {
    const id = (booking as { assignedTo?: unknown }).assignedTo;
    if (id != null && String(id).trim() !== "") return `Employee #${String(id)}`;
  }
  return "—";
}

function assignedEmployeeEmail(booking: unknown): string {
  const v = registrationField(booking, "assignedEmployeeEmail", "employeeEmail");
  if (!isUnsetDisplay(v)) return v;
  if (booking != null && typeof booking === "object" && "assignedUser" in booking) {
    const e = (booking as { assignedUser?: { email?: string | null } }).assignedUser?.email;
    if (e != null) {
      const s = String(e).trim();
      if (s !== "" && !isUnsetDisplay(s)) return s;
    }
  }
  return "—";
}

function assignedEmployeePhone(booking: unknown): string {
  const v = registrationField(booking, "assignedEmployeePhone", "employeePhone");
  if (!isUnsetDisplay(v)) return v;
  if (booking != null && typeof booking === "object" && "assignedUser" in booking) {
    const m = (booking as { assignedUser?: { mobileNumber?: string | null } }).assignedUser
      ?.mobileNumber;
    if (m != null) {
      const s = String(m).trim();
      if (s !== "" && !isUnsetDisplay(s)) return s;
    }
  }
  return "—";
}

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

/** Pet rows on admin booking detail: from API `pets` or derived from `schedules[].pet`. */
interface BookingPetRow {
  id: number;
  name?: string | null;
  breed?: string | null;
  gender?: string | null;
  dob?: string | null;
  weight?: string | null;
  color?: string | null;
  notes?: string | null;
  petTypeName?: string | null;
}

function petDetailLine(v: unknown): string {
  if (v == null) return "—";
  const s = String(v).trim();
  return s !== "" && !isUnsetDisplay(s) ? s : "—";
}

function bookingPetsFromResponse(booking: unknown): BookingPetRow[] {
  if (booking == null || typeof booking !== "object") return [];
  const b = booking as Record<string, unknown>;
  if (Array.isArray(b.pets) && b.pets.length > 0) {
    return (b.pets as Record<string, unknown>[]).flatMap((p) => {
      const id = p.id;
      if (typeof id !== "number") return [];
      return [
        {
          id,
          name: p.name != null ? String(p.name) : undefined,
          breed: p.breed != null ? String(p.breed) : null,
          gender: p.gender != null ? String(p.gender) : null,
          dob: p.dob != null ? String(p.dob) : null,
          weight: p.weight != null && String(p.weight).trim() !== ""
            ? String(p.weight)
            : null,
          color: p.color != null ? String(p.color) : null,
          notes: p.notes != null ? String(p.notes) : null,
          petTypeName:
            p.petTypeName != null ? String(p.petTypeName) : null,
        },
      ];
    });
  }
  const schedules = b.schedules;
  if (!Array.isArray(schedules)) return [];
  const byId = new Map<number, BookingPetRow>();
  for (const s of schedules) {
    if (s == null || typeof s !== "object") continue;
    const pet = (s as Record<string, unknown>).pet;
    if (pet == null || typeof pet !== "object") continue;
    const p = pet as Record<string, unknown>;
    const id = p.id;
    if (typeof id !== "number" || byId.has(id)) continue;
    const pt = p.petType;
    const typeName =
      pt != null && typeof pt === "object" && "name" in pt
        ? String((pt as { name?: unknown }).name ?? "").trim() || null
        : null;
    byId.set(id, {
      id,
      name: p.name != null ? String(p.name) : undefined,
      breed: p.breed != null ? String(p.breed) : null,
      gender: p.gender != null ? String(p.gender) : null,
      dob: p.dob != null ? String(p.dob) : null,
      weight:
        p.weight != null && String(p.weight).trim() !== ""
          ? String(p.weight)
          : null,
      color: p.color != null ? String(p.color) : null,
      notes: p.notes != null ? String(p.notes) : null,
      petTypeName: typeName,
    });
  }
  return [...byId.values()];
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

  const bookingApiOpts = useMemo(
    () => ({
      url: `/api/users/booking/${id}`,
      method: "GET" as const,
      type: "manual" as const,
      requiresAuth: true,
    }),
    [id]
  );
  const { data: bookingData, fetchApi: fetchBooking, loading: loadingBooking } =
    useApi(bookingApiOpts);

  const bookingPatchOpts = useMemo(
    () => ({
      url: `/api/users/booking/${id}`,
      method: "PATCH" as const,
      type: "manual" as const,
      requiresAuth: true,
    }),
    [id]
  );
  const { sendData, loading: saving } = useApi(bookingPatchOpts);

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

  const bookingPets = useMemo(
    () => bookingPetsFromResponse(bookingData),
    [bookingData]
  );

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

  const detailLabelClass =
    "text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400";
  const detailValueClass =
    "mt-1 text-sm font-medium text-gray-900 dark:text-gray-100";
  const sectionCardClass =
    "rounded-xl border border-gray-200/90 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-950/50 dark:shadow-none sm:p-6";
  const sectionTitleClass =
    "text-sm font-semibold text-gray-900 dark:text-white";

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-black/[0.03] dark:border-gray-800 dark:bg-gray-900 dark:ring-white/[0.04]">
      <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-6 dark:border-gray-800 dark:bg-gray-950/60 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Booking record
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Booking #{bookingData?.id}
            </h3>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {bookingData?.status ? (
                <Badge size="sm" color={statusColor(String(bookingData.status))}>
                  {String(bookingData.status)}
                </Badge>
              ) : null}
              {bookingData?.categoryName || bookingData?.serviceName ? (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {[bookingData?.categoryName, bookingData?.serviceName]
                    .filter(Boolean)
                    .join(" · ") || null}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 justify-end sm:pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/admin/chat?bookingId=${bookingData?.id ?? id}`)}
              className="!flex-none gap-1.5 !py-2 !px-3.5 text-xs inline-flex w-auto shrink-0 items-center"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
        <section className={sectionCardClass} aria-labelledby="person-details-heading">
          <div className="mb-5 border-b border-gray-100 pb-4 dark:border-gray-800">
            <h4 id="person-details-heading" className={sectionTitleClass}>
              Person details
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Customer contact and registration on file
            </p>
          </div>
          <dl className="grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2">
            <div>
              <dt className={detailLabelClass}>Name</dt>
              <dd className={detailValueClass}>
                {registrationDisplayName(bookingData)}
              </dd>
            </div>
            <div>
              <dt className={detailLabelClass}>Email</dt>
              <dd className={detailValueClass}>
                {registrationField(bookingData, "userEmail", "email")}
              </dd>
            </div>
            <div>
              <dt className={detailLabelClass}>Mobile number</dt>
              <dd className={detailValueClass}>
                {registrationField(bookingData, "userPhone", "mobileNumber")}
              </dd>
            </div>
            <div>
              <dt className={detailLabelClass}>Emergency contact name</dt>
              <dd className={detailValueClass}>
                {registrationField(
                  bookingData,
                  "emergencyContactName",
                  "emergencyname"
                )}
              </dd>
            </div>
            <div>
              <dt className={detailLabelClass}>Emergency contact phone</dt>
              <dd className={detailValueClass}>
                {registrationField(
                  bookingData,
                  "emergencyContactPhone",
                  "emergencyNumber"
                )}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className={detailLabelClass}>Address</dt>
              <dd
                className={`${detailValueClass} break-words leading-relaxed`}
              >
                {registrationCombinedAddress(bookingData)}
              </dd>
            </div>
          </dl>
        </section>

        <section className={sectionCardClass} aria-labelledby="pets-details-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
            <div>
              <h4 id="pets-details-heading" className={sectionTitleClass}>
                Pets
              </h4>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Animals included on this booking
              </p>
            </div>
            <p className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold tabular-nums text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              Total: {bookingPets.length}
            </p>
          </div>
          {bookingPets.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No pets linked to this booking&apos;s schedules yet.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {bookingPets.map((pet) => (
                <div
                  key={pet.id}
                  className="rounded-lg border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/60 sm:p-5"
                >
                  <p className="mb-4 border-b border-gray-100 pb-3 text-sm font-semibold text-gray-900 dark:border-gray-800 dark:text-white">
                    {pet.name != null &&
                    String(pet.name).trim() !== "" &&
                    !isUnsetDisplay(String(pet.name))
                      ? String(pet.name).trim()
                      : `Pet #${pet.id}`}
                  </p>
                  <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
                    <div>
                      <dt className={detailLabelClass}>Type</dt>
                      <dd className={detailValueClass}>
                        {petDetailLine(pet.petTypeName)}
                      </dd>
                    </div>
                    <div>
                      <dt className={detailLabelClass}>Breed</dt>
                      <dd className={detailValueClass}>
                        {petDetailLine(pet.breed)}
                      </dd>
                    </div>
                    <div>
                      <dt className={detailLabelClass}>Gender</dt>
                      <dd className={detailValueClass}>
                        {petDetailLine(pet.gender)}
                      </dd>
                    </div>
                    <div>
                      <dt className={detailLabelClass}>Date of birth</dt>
                      <dd className={detailValueClass}>
                        {petDetailLine(pet.dob)}
                      </dd>
                    </div>
                    <div>
                      <dt className={detailLabelClass}>Weight</dt>
                      <dd className={detailValueClass}>
                        {petDetailLine(pet.weight)}
                      </dd>
                    </div>
                    <div>
                      <dt className={detailLabelClass}>Color</dt>
                      <dd className={detailValueClass}>
                        {displayPetColor(pet.color)}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={sectionCardClass} aria-labelledby="booking-details-heading">
          <div className="mb-5 border-b border-gray-100 pb-4 dark:border-gray-800">
            <h4 id="booking-details-heading" className={sectionTitleClass}>
              Service &amp; schedule
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Primary slot summary from the booking
            </p>
          </div>
          <dl className="grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className={detailLabelClass}>Category / Service</dt>
              <dd className={detailValueClass}>
                {bookingData?.categoryName ?? "—"} /{" "}
                {bookingData?.serviceName ?? "—"}
              </dd>
            </div>
            <div>
              <dt className={detailLabelClass}>Schedule date</dt>
              <dd className={detailValueClass}>
                {bookingData?.scheduleDate
                  ? formatDateOnly(bookingData.scheduleDate)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className={detailLabelClass}>Schedule time</dt>
              <dd className={detailValueClass}>
                {bookingData?.scheduleTime ? bookingData.scheduleTime : "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className={sectionCardClass} aria-labelledby="employee-details-heading">
          <div className="mb-5 border-b border-gray-100 pb-4 dark:border-gray-800">
            <h4 id="employee-details-heading" className={sectionTitleClass}>
              Assigned employee
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Staff member responsible for this booking
            </p>
          </div>
          {!bookingHasAssignedEmployee(bookingData) ? (
            <div
              className="rounded-lg border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-100/90"
              role="status"
            >
              This booking is not assigned to any employee.
            </div>
          ) : (
            <dl className="grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2">
              <div>
                <dt className={detailLabelClass}>Name</dt>
                <dd className={detailValueClass}>
                  {assignedEmployeeDisplayName(bookingData)}
                </dd>
              </div>
              <div>
                <dt className={detailLabelClass}>Email</dt>
                <dd className={detailValueClass}>
                  {assignedEmployeeEmail(bookingData)}
                </dd>
              </div>
            </dl>
          )}
        </section>

        <form
          onSubmit={handleSubmit}
          className={`${sectionCardClass} border-dashed border-gray-200 dark:border-gray-700`}
        >
          <div className="mb-6 border-b border-gray-100 pb-4 dark:border-gray-800">
            <h4 className={sectionTitleClass}>Update booking</h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Assign staff and set status — changes apply on save
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
            <div className="space-y-2">
              <label
                htmlFor="assign-employee"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Assign employee
              </label>
              <select
                id="assign-employee"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              >
                <option value="">— Select employee —</option>
                {employees.map(
                  (emp: {
                    id: number;
                    name?: string | null;
                    email?: string | null;
                  }) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name ?? emp.email ?? `Employee #${emp.id}`}
                    </option>
                  )
                )}
              </select>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="booking-status"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Status
              </label>
              <select
                id="booking-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              >
                {BOOKING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errorMsg && (
            <p className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">
              {errorMsg}
            </p>
          )}
          {successMsg && (
            <p className="mt-4 text-sm font-medium text-green-600 dark:text-green-400">
              {successMsg}
            </p>
          )}

          <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">
            <Button
              type="submit"
              variant="secondary"
              loading={saving}
              className="!flex-none w-40 sm:w-44"
            >
              Save status
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/admin/booking")}
              className="!flex-none w-40 sm:w-44"
            >
              Back to list
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
