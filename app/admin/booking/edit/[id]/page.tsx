"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function EditBookingStatus() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [status, setStatus] = useState<string>("PENDING");
  const [assignedTo, setAssignedTo] = useState<string>("");
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
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Edit Booking Status</h3>
        <p className="mt-1 text-sm text-gray-500">Booking #{bookingData?.id}</p>
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
            <dt className="text-gray-500">Total</dt>
            <dd className="font-medium text-gray-800 dark:text-white">${Number(bookingData?.totalPrice ?? 0).toFixed(2)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Schedule</dt>
            <dd className="font-medium text-gray-800 dark:text-white">
              {bookingData?.scheduleDate ? formatDate(bookingData.scheduleDate) : "—"} {bookingData?.scheduleTime ?? ""}
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
              {(() => {
                const schedules: ScheduleRow[] =
                  Array.isArray((bookingData as { schedules?: ScheduleRow[] })?.schedules) &&
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
                      : [];
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
                );
              })()}
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
