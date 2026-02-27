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
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800">
        <p className="text-gray-500">Loading booking...</p>
      </div>
    );
  }

  if (!bookingData && !loadingBooking) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800">
        <p className="text-gray-500">Booking not found.</p>
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

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Edit Employee Booking
          </h3>
          <p className="mt-1 text-sm text-gray-500">Booking #{bookingData?.id}</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(`/admin/chat?bookingId=${bookingData?.id ?? ""}`)}
          className="inline-flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Chat
        </Button>
      </div>

      <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/30">
        <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          Booking details
        </h4>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">User name</dt>
            <dd className="font-medium text-gray-800 dark:text-white">
              {bookingData?.userName ?? bookingData?.userId ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium text-gray-800 dark:text-white">
              {bookingData?.userEmail ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Phone</dt>
            <dd className="font-medium text-gray-800 dark:text-white">
              {bookingData?.userPhone ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Category / Service</dt>
            <dd className="font-medium text-gray-800 dark:text-white">
              {bookingData?.categoryName ?? "—"} / {bookingData?.serviceName ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Total</dt>
            <dd className="font-medium text-gray-800 dark:text-white">
              ${Number(bookingData?.totalPrice ?? 0).toFixed(2)}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Schedule</dt>
            <dd className="font-medium text-gray-800 dark:text-white">
              {bookingData?.scheduleDate ? formatDate(bookingData.scheduleDate) : "—"}{" "}
              {bookingData?.scheduleTime ?? ""}
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

      {/* Booking schedules table */}
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
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
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
                            scheduleTime: bookingData?.scheduleTime ?? null,
                            isStarted: bookingData?.isStarted ?? false,
                            isCompleted: bookingData?.isCompleted ?? false,
                          },
                        ]
                      : []);
                return schedules.length > 0 ? (
                  schedules.map((row: ScheduleRow, idx: number) => (
                    <TableRow key={row.id ?? idx}>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {row.scheduleDate ? formatDateOnly(row.scheduleDate) : "—"}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {row.scheduleTime ?? "—"}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {row.isStarted ? "Yes" : "No"}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {row.isCompleted ? "Yes" : "No"}
                      </TableCell>
                      <TableCell className="py-3 text-theme-sm dark:text-gray-400">
                        {!!row.isStarted && !!row.isCompleted ? (
                          <span className="text-green-600 dark:text-green-400 font-medium">Completed</span>
                        ) : row.id != null ? !!row.isStarted ? (
                          <Button
                            type="button"
                            variant="secondary"
                            className="!py-1.5 !px-3 text-theme-xs"
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
                            className="!py-1.5 !px-3 text-theme-xs"
                            onClick={() => handleScheduleStart(row, idx)}
                            loading={scheduleUpdatingId === row.id}
                            disabled={scheduleUpdatingId !== null}
                          >
                            Start
                          </Button>
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
                      className="py-6 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                    >
                      No schedule entries.
                    </TableCell>
                  </TableRow>
                );
              })()}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
