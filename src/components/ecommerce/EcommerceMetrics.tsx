"use client";
import React, { useEffect } from "react";
import {
  ArrowUpIcon,
  GroupIcon,
  DollarSign,
  TrendingUp,
  CalendarDays,
  CircleCheck,
  Clock,
} from "lucide-react";
import useApi from "@/utils/useApi";
import { useCurrentUser } from "@/utils/currentUser";

export const EcommerceMetrics = () => {
  const { user } = useCurrentUser();
  const { data: metricsData, fetchApi } = useApi({
    url: "/api/admin/dashboard-metrics",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    void fetchApi();
  }, []);

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const totalClients =
    metricsData &&
    typeof metricsData === "object" &&
    "totalClients" in metricsData &&
    typeof (metricsData as { totalClients: unknown }).totalClients === "number"
      ? (metricsData as { totalClients: number }).totalClients
      : 0;
  const totalEmployees =
    metricsData &&
    typeof metricsData === "object" &&
    "totalEmployees" in metricsData &&
    typeof (metricsData as { totalEmployees: unknown }).totalEmployees === "number"
      ? (metricsData as { totalEmployees: number }).totalEmployees
      : 0;
  const totalBookings =
    metricsData &&
    typeof metricsData === "object" &&
    "totalBookings" in metricsData &&
    typeof (metricsData as { totalBookings: unknown }).totalBookings === "number"
      ? (metricsData as { totalBookings: number }).totalBookings
      : 0;
  const employeeTotalBooking =
    metricsData &&
    typeof metricsData === "object" &&
    "employeeTotalBooking" in metricsData &&
    typeof (metricsData as { employeeTotalBooking: unknown }).employeeTotalBooking ===
      "number"
      ? (metricsData as { employeeTotalBooking: number }).employeeTotalBooking
      : 0;
  const employeeTotalCompleteBooking =
    metricsData &&
    typeof metricsData === "object" &&
    "employeeTotalCompleteBooking" in metricsData &&
    typeof (metricsData as { employeeTotalCompleteBooking: unknown })
      .employeeTotalCompleteBooking === "number"
      ? (metricsData as { employeeTotalCompleteBooking: number })
          .employeeTotalCompleteBooking
      : 0;
  const employeeTotalPendingBooking =
    metricsData &&
    typeof metricsData === "object" &&
    "employeeTotalPendingBooking" in metricsData &&
    typeof (metricsData as { employeeTotalPendingBooking: unknown })
      .employeeTotalPendingBooking === "number"
      ? (metricsData as { employeeTotalPendingBooking: number })
          .employeeTotalPendingBooking
      : 0;
  const totalServices =
    metricsData &&
    typeof metricsData === "object" &&
    "totalServices" in metricsData &&
    typeof (metricsData as { totalServices: unknown }).totalServices === "number"
      ? (metricsData as { totalServices: number }).totalServices
      : 0;

  const userGroupIdNum =
    user != null &&
    typeof user === "object" &&
    "userGroupId" in user &&
    (user as { userGroupId: unknown }).userGroupId != null &&
    (user as { userGroupId: unknown }).userGroupId !== ""
      ? Number((user as { userGroupId: number | string }).userGroupId)
      : NaN;
  const isUserGroup3 =
    Number.isFinite(userGroupIdNum) && userGroupIdNum === 3;

  return (
    <div className="space-y-4 md:space-y-6">
      <div
        className={
          isUserGroup3
            ? "grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-3 md:gap-6 max-w-4xl"
            : "grid grid-cols-1 gap-4 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 md:gap-6"
        }
      >
      {isUserGroup3 ? (
      <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <CalendarDays className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Employee total bookings
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatNumber(employeeTotalBooking)}
            </h4>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <CircleCheck className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Employee total complete bookings
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatNumber(employeeTotalCompleteBooking)}
            </h4>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <Clock className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Employee total pending bookings
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatNumber(employeeTotalPendingBooking)}
            </h4>
          </div>
        </div>
      </div>
      </>
      ) : (
      <>
      {/* Complete Services */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Clients
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatNumber(totalClients)}
            </h4>
          </div>
        </div>
      </div>

      {/* Pending Services */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <ArrowUpIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Employees
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatNumber(totalEmployees)}
            </h4>
          </div>
        </div>
      </div>

      {/* Revenue Of Services */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <DollarSign className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Bookings
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatNumber(totalBookings)}
            </h4>
          </div>
        </div>
      </div>
      
      {/* Profit of Services */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <TrendingUp className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Services
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatNumber(totalServices)}
            </h4>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
    </div>
  );
};
