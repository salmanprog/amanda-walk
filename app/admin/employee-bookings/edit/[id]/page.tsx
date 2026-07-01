"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import Button from "@/components/ui/button/Button";
import useApi from "@/utils/useApi";
import Badge from "@/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

interface ScheduleRow {
  id?: number;
  scheduleDate?: string | Date | null;
  scheduleSlot?: string | null;
  scheduleTime?: string | null;
  isStarted?: boolean;
  isCompleted?: boolean;
}

export default function EditEmployeeBookingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [status, setStatus] = useState<string>("PENDING");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [scheduleUpdatingId, setScheduleUpdatingId] = useState<number | null>(null);
  const [localSchedules, setLocalSchedules] = useState<ScheduleRow[] | null>(null);

  const { data: bookingData, fetchApi: fetchBooking, loading: loadingBooking } = useApi({
    url: id ? `/api/users/booking/${id}` : "",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  const { sendData, loading: saving } = useApi({
    url: id ? `/api/users/booking/${id}` : "",
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
    document.title = "Admin | Edit Employee Booking";
  }, []);

  useEffect(() => {
    if (id) fetchBooking();
    fetchEmployees();
  }, [id]);

  useEffect(() => {
    if (bookingData?.status) setStatus(bookingData.status);
    if (bookingData?.assignedTo != null) setAssignedTo(String(bookingData.assignedTo));
    const list =
      Array.isArray((bookingData as { schedules?: ScheduleRow[] })?.schedules) &&
      (bookingData as { schedules?: ScheduleRow[] }).schedules!.length > 0
        ? (bookingData as { schedules: ScheduleRow[] }).schedules
        : bookingData?.scheduleDate != null || bookingData?.scheduleTime != null
          ? [
              {
                id: undefined,
                scheduleDate: bookingData?.scheduleDate ?? null,
                scheduleTime: bookingData?.scheduleTime ?? null,
                isStarted: bookingData?.isStarted ?? false,
                isCompleted: bookingData?.isCompleted ?? false,
              },
            ]
          : [];
    setLocalSchedules(list);
  }, [bookingData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    const payload: { status: string; assignedTo?: number | null } = { status };
    payload.assignedTo = assignedTo === "" ? null : Number(assignedTo);
    try {
      const res = await sendData(payload, undefined, "PATCH");
      if (res?.code === 200) {
        setSuccessMsg("Booking status updated successfully.");
        if (res?.data?.status) setStatus(res.data.status);
        if (res?.data?.assignedTo != null) setAssignedTo(String(res.data.assignedTo));
        else if (res?.data?.assignedTo === null) setAssignedTo("");
      } else {
        setErrorMsg(res?.message || "Update failed.");
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || "Update failed. Try again.");
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "PENDING":
        return "warning";
      case "CONFIRMED":
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "error";
      default:
        return "warning";
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

  const updateSchedule = async (
    scheduleId: number,
    idx: number,
    payload: { isStarted?: boolean; isCompleted?: boolean }
  ) => {
    setScheduleUpdatingId(scheduleId);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || sessionStorage.getItem("token") || ""
          : "";
      const res = await fetch(`${baseUrl}/api/admin/booking-schedule/${scheduleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.code === 200 && localSchedules) {
        setLocalSchedules((prev) =>
          (prev ?? []).map((s, i) =>
            i === idx ? { ...s, ...payload } : s
          )
        );
      } else if (json.code !== 200) {
        setErrorMsg(json.message || "Failed to update schedule.");
      }
    } finally {
      setScheduleUpdatingId(null);
    }
  };

  const handleScheduleStart = (row: ScheduleRow, idx: number) => {
    if (row.id == null || !!row.isStarted) return;
    updateSchedule(row.id, idx, { isStarted: true });
  };

  const handleScheduleComplete = (row: ScheduleRow, idx: number) => {
    if (row.id == null || !!row.isCompleted) return;
    updateSchedule(row.id, idx, { isCompleted: true });
  };

  if (loadingBooking && !bookingData) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm ring-1 ring-black/[0.03] dark:border-gray-800 dark:bg-gray-900 dark:ring-white/[0.04]">
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading booking…</p>
      </div>
    );
  }

  if (!bookingData && !loadingBooking) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm ring-1 ring-black/[0.03] dark:border-gray-800 dark:bg-gray-900 dark:ring-white/[0.04]">
        <p className="text-sm text-gray-500 dark:text-gray-400">Booking not found.</p>
        <Button
          className="mt-4"
          variant="secondary"
          onClick={() => router.push("/admin/employee-bookings")}
        >
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
              Assigned booking
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
              onClick={() => {
                const bid = bookingData?.id ?? id;
                window.location.assign(`/admin/chat?bookingId=${bid}`);
              }}
              className="!flex-none gap-1.5 !py-2 !px-3.5 text-xs inline-flex w-auto shrink-0 items-center"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
        <section className={sectionCardClass} aria-labelledby="employee-booking-details-heading">
          <div className="mb-5 border-b border-gray-100 pb-4 dark:border-gray-800">
            <h4 id="employee-booking-details-heading" className={sectionTitleClass}>
              Customer &amp; booking
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Contact and service summary for this assignment
            </p>
          </div>
          <dl className="grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2">
            <div>
              <dt className={detailLabelClass}>User name</dt>
              <dd className={detailValueClass}>
                {bookingData?.userName ?? bookingData?.userId ?? "—"}
              </dd>
            </div>
            <div>
              <dt className={detailLabelClass}>Email</dt>
              <dd className={detailValueClass}>{bookingData?.userEmail ?? "—"}</dd>
            </div>
            <div>
              <dt className={detailLabelClass}>Phone</dt>
              <dd className={detailValueClass}>{bookingData?.userPhone ?? "—"}</dd>
            </div>
            <div>
              <dt className={detailLabelClass}>Category / Service</dt>
              <dd className={detailValueClass}>
                {bookingData?.categoryName ?? "—"} / {bookingData?.serviceName ?? "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className={sectionCardClass} aria-labelledby="employee-booking-schedules-heading">
          <div className="mb-5 border-b border-gray-100 pb-4 dark:border-gray-800">
            <h4 id="employee-booking-schedules-heading" className={sectionTitleClass}>
              Booking schedules
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Walk dates, times, and completion status
            </p>
          </div>
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-y border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Schedule date
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Schedule time
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Started
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Completed
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {(() => {
                  const schedules: ScheduleRow[] =
                    localSchedules ??
                    (Array.isArray((bookingData as { schedules?: ScheduleRow[] })?.schedules) &&
                    (bookingData as { schedules?: ScheduleRow[] }).schedules!.length > 0
                      ? (bookingData as { schedules: ScheduleRow[] }).schedules
                      : bookingData?.scheduleDate != null || bookingData?.scheduleTime != null
                        ? [
                            {
                              scheduleDate: bookingData?.scheduleDate ?? null,
                              scheduleSlot: bookingData?.scheduleSlot ?? null,
                              scheduleTime: bookingData?.scheduleTime ?? null,
                              isStarted: bookingData?.isStarted ?? false,
                              isCompleted: bookingData?.isCompleted ?? false,
                            },
                          ]
                        : []);
                  return schedules.length > 0 ? (
                    schedules.map((row: ScheduleRow, idx: number) => (
                      <TableRow key={row.id ?? idx}>
                        <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                          {row.scheduleDate ? formatDateOnly(row.scheduleDate) : "—"}
                        </TableCell>
                        <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                          {row.scheduleSlot != null && String(row.scheduleSlot).trim() !== ""
                            ? String(row.scheduleSlot).trim()
                            : (row.scheduleTime ?? "—")}
                        </TableCell>
                        <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                          {row.isStarted ? "Yes" : "No"}
                        </TableCell>
                        <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                          {row.isCompleted ? "Yes" : "No"}
                        </TableCell>
                        <TableCell className="py-3 text-theme-sm dark:text-gray-400">
                          {!!row.isStarted && !!row.isCompleted ? (
                            <span className="font-medium text-green-600 dark:text-green-400">
                              Completed
                            </span>
                          ) : row.id != null ? (
                            !!row.isStarted ? (
                              <Button
                                type="button"
                                variant="secondary"
                                className="!px-3 !py-1.5 text-theme-xs"
                                onClick={() => handleScheduleComplete(row, idx)}
                                loading={scheduleUpdatingId === row.id}
                                disabled={scheduleUpdatingId !== null}
                              >
                                Complete
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="secondary"
                                className="!px-3 !py-1.5 text-theme-xs"
                                onClick={() => handleScheduleStart(row, idx)}
                                loading={scheduleUpdatingId === row.id}
                                disabled={scheduleUpdatingId !== null}
                              >
                                Start
                              </Button>
                            )
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-6 text-center text-theme-sm text-gray-500 dark:text-gray-400"
                      >
                        No schedule entries.
                      </TableCell>
                    </TableRow>
                  );
                })()}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </div>
  );
}
