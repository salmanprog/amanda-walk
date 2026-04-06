"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarCheck, MessageCircle } from "lucide-react";
import useApi from "@/utils/useApi";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useCurrentUser } from "@/utils/currentUser";
import Button from "@/components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";

function formatBookingScheduleDate(v: string | Date | null | undefined): string {
  if (v == null || v === "") return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function displayScheduleSlotOrTime(
  slot: string | null | undefined,
  time: string | null | undefined
): string {
  if (slot != null && String(slot).trim() !== "") return String(slot).trim();
  if (time != null && String(time).trim() !== "") return String(time).trim();
  return "—";
}

function firstNonEmptyStr(
  a: string | null | undefined,
  b: string | null | undefined
): string {
  const t = (v: string | null | undefined) =>
    v != null && String(v).trim() !== "" ? String(v).trim() : "";
  return t(a) || t(b);
}

type BookingItem = {
  id: number;
  userId?: number;
  assignedTo?: number | null;
  assignedEmployeeName?: string | null;
  assignedEmployeeEmail?: string | null;
  assignedEmployeePhone?: string | null;
  petId?: number | null;
  petName?: string | null;
  petBreed?: string | null;
  petGender?: string | null;
  petDob?: string | null;
  petWeight?: string | null;
  petColor?: string | null;
  petNotes?: string | null;
  petTypeName?: string | null;
  serviceCategoryId?: number;
  serviceId?: number;
  userName?: string;
  userEmail?: string | null;
  userPhone?: string | null;
  categoryName?: string;
  serviceName?: string;
  serviceMints?: string | null;
  quantity?: number;
  tax?: number;
  discount?: number;
  totalPrice: number;
  isPaid?: boolean;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  scheduleDate?: string | null;
  scheduleTime?: string | null;
  scheduleSlot?: string | null;
  isStarted?: boolean;
  isCompleted?: boolean;
  schedules?: Array<{
    id?: number;
    employeeId?: number;
    employeeName?: string | null;
    employeeEmail?: string | null;
    employeePhone?: string | null;
    scheduleDate?: string | Date | null;
    scheduleTime?: string | null;
    scheduleSlot?: string | null;
    isStarted?: boolean;
    isCompleted?: boolean;
    petId?: number | null;
    petName?: string | null;
    petBreed?: string | null;
    petGender?: string | null;
    petDob?: string | null;
    petWeight?: string | null;
    petColor?: string | null;
    petNotes?: string | null;
    petTypeName?: string | null;
  }>;
};

interface AccountUserLite {
  id: number;
  email?: string | null;
  mobileNumber?: string | null;
  phone?: string | null;
}

export default function BookingListPage() {
  useAuthGuard();
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const user = currentUser as AccountUserLite | null;

  const { data: bookingsData, fetchApi: fetchBookings, loading: loadingBookings } = useApi({
    url: "/api/users/booking",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [viewBookingDetails, setViewBookingDetails] = useState<BookingItem | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const bookingDetailsContactEmail = useMemo(() => {
    if (!viewBookingDetails) return "";
    const raw = viewBookingDetails.userEmail;
    if (raw != null && String(raw).trim() !== "") return String(raw).trim();
    if (
      user &&
      viewBookingDetails.userId != null &&
      Number(viewBookingDetails.userId) === Number(user.id) &&
      user.email != null &&
      String(user.email).trim() !== ""
    ) {
      return String(user.email).trim();
    }
    return "";
  }, [viewBookingDetails, user]);

  const bookingDetailsContactPhone = useMemo(() => {
    if (!viewBookingDetails) return "";
    const raw = viewBookingDetails.userPhone;
    if (raw != null && String(raw).trim() !== "") return String(raw).trim();
    if (
      user &&
      viewBookingDetails.userId != null &&
      Number(viewBookingDetails.userId) === Number(user.id)
    ) {
      const m = user.mobileNumber ?? user.phone;
      if (m != null && String(m).trim() !== "") return String(m).trim();
    }
    return "";
  }, [viewBookingDetails, user]);

  const bookingPetDisplay = useMemo(() => {
    if (!viewBookingDetails) {
      return { petName: "", petTypeName: "", petBreed: "", petGender: "" };
    }
    const row = viewBookingDetails.schedules?.[0];
    return {
      petName: firstNonEmptyStr(viewBookingDetails.petName, row?.petName),
      petTypeName: firstNonEmptyStr(
        viewBookingDetails.petTypeName,
        row?.petTypeName
      ),
      petBreed: firstNonEmptyStr(viewBookingDetails.petBreed, row?.petBreed),
      petGender: firstNonEmptyStr(
        viewBookingDetails.petGender,
        row?.petGender
      ),
    };
  }, [viewBookingDetails]);

  useEffect(() => {
    void fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (bookingsData && Array.isArray(bookingsData)) {
      setBookings(bookingsData as BookingItem[]);
    }
  }, [bookingsData]);

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-2xl shadow-2xl p-6 mb-6"
    >
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-[var(--primary-theme)] rounded-full flex items-center justify-center mb-4 shadow-lg">
          <CalendarCheck className="text-white" size={32} />
        </div>
        <h1 className="text-3xl font-bold gradient-text text-center">My Bookings</h1>
        <p className="text-sm text-gray-500 mt-2 text-center">Your scheduled services</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200 max-w-full overflow-x-auto">
        {loadingBookings ? (
          <p className="text-gray-500 py-4">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-500 py-4">No bookings yet.</p>
        ) : (
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  ID
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Category
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Service
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Date
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Time
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Total
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
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
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {booking.id}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {booking.categoryName ?? "—"}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {booking.serviceName ?? "—"}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {formatBookingScheduleDate(booking.scheduleDate ?? undefined)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {displayScheduleSlotOrTime(booking.scheduleSlot, booking.scheduleTime)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    ${Number(booking.totalPrice).toFixed(2)}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      size="sm"
                      color={
                        booking.status === "PENDING"
                          ? "warning"
                          : booking.status === "CANCELLED"
                            ? "error"
                            : "success"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="!py-1.5 !px-3 text-theme-xs"
                        onClick={() => setViewBookingDetails(booking)}
                      >
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </motion.div>

    {mounted &&
      viewBookingDetails &&
      createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-detail-title"
          className="fixed inset-0 z-[200] overflow-y-auto bg-black/50"
          onClick={() => setViewBookingDetails(null)}
        >
          <div
            className="flex min-h-[100dvh] items-center justify-center p-4 py-10"
            onClick={() => setViewBookingDetails(null)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full shrink-0 p-6 border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3
                  id="booking-detail-title"
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  Booking #{viewBookingDetails.id}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="inline-flex items-center gap-1.5"
                    onClick={() => {
                      setViewBookingDetails(null);
                      router.push(`/chat?bookingId=${viewBookingDetails.id}`);
                    }}
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    Chat with employee
                  </Button>
                  <button
                    type="button"
                    onClick={() => setViewBookingDetails(null)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none"
                  >
                    &times;
                  </button>
                </div>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-6">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">User name</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {viewBookingDetails.userName ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Email</dt>
                  <dd className="font-medium text-gray-900 dark:text-white break-all">
                    {bookingDetailsContactEmail || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Phone</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {bookingDetailsContactPhone || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Category</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {viewBookingDetails.categoryName ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Service</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {viewBookingDetails.serviceName ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Service duration</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {viewBookingDetails.serviceMints != null &&
                    String(viewBookingDetails.serviceMints).trim() !== ""
                      ? String(viewBookingDetails.serviceMints).trim()
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Schedule date</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {formatBookingScheduleDate(viewBookingDetails.scheduleDate ?? undefined)}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Schedule time</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {displayScheduleSlotOrTime(
                      viewBookingDetails.scheduleSlot,
                      viewBookingDetails.scheduleTime
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Assigned employee name</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {viewBookingDetails.assignedEmployeeName != null &&
                    String(viewBookingDetails.assignedEmployeeName).trim() !== ""
                      ? String(viewBookingDetails.assignedEmployeeName).trim()
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Assigned employee email</dt>
                  <dd className="font-medium text-gray-900 dark:text-white break-all">
                    {viewBookingDetails.assignedEmployeeEmail != null &&
                    String(viewBookingDetails.assignedEmployeeEmail).trim() !== ""
                      ? String(viewBookingDetails.assignedEmployeeEmail).trim()
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Pet name</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {bookingPetDisplay.petName || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Pet type</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {bookingPetDisplay.petTypeName || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Breed</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {bookingPetDisplay.petBreed || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Gender</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {bookingPetDisplay.petGender || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Walk started</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {viewBookingDetails.isStarted != null
                      ? viewBookingDetails.isStarted
                        ? "Yes"
                        : "No"
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Walk completed</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {viewBookingDetails.isCompleted != null
                      ? viewBookingDetails.isCompleted
                        ? "Yes"
                        : "No"
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Total</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    ${Number(viewBookingDetails.totalPrice).toFixed(2)}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Status</dt>
                  <dd>
                    <Badge
                      size="sm"
                      color={
                        viewBookingDetails.status === "PENDING"
                          ? "warning"
                          : viewBookingDetails.status === "CANCELLED"
                            ? "error"
                            : "success"
                      }
                    >
                      {viewBookingDetails.status}
                    </Badge>
                  </dd>
                </div>
              </dl>
              <div className="mt-6">
                <Button type="button" variant="secondary" onClick={() => setViewBookingDetails(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
