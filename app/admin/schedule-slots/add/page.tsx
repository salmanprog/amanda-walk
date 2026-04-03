"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import useApi from "@/utils/useApi";
import type { ApiResponse } from "@/utils/useApi";

export default function AddScheduleSlot() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Admin | Add Schedule Slot";
  }, []);

  const [startTime, setStartTime] = useState("");
  const [startAmPM, setStartAmPM] = useState("AM");
  const [endTime, setEndTime] = useState("");
  const [endAmPM, setEndAmPM] = useState("AM");
  const [status, setStatus] = useState("1");
  const [errorMsg, setErrorMsg] = useState("");

  const { sendData, loading } = useApi({
    url: "/api/admin/schedule-slots",
    type: "manual",
    requiresAuth: true,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!startTime.trim()) return setErrorMsg("Start time is required.");
    if (!endTime.trim()) return setErrorMsg("End time is required.");

    try {
      const res = await sendData<ApiResponse>(
        {
          startTime: startTime.trim(),
          startAmPM,
          endTime: endTime.trim(),
          endAmPM,
          status,
        },
        undefined,
        "POST"
      );

      if (res.code === 200) {
        router.push("/admin/schedule-slots");
      } else {
        setErrorMsg(res.message || "Something went wrong.");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An error occurred. Try again.");
    }
  };

  const inputClass =
    "h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs bg-transparent border-gray-300 focus:border-brand-300 dark:bg-gray-900 dark:text-white dark:border-gray-700";

  return (
    <div className="p-4 mx-auto md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Add Schedule Slot
        </h2>
        <nav>
          <ol className="flex items-center gap-1.5">
            <li>
              <a
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
                href="/admin"
              >
                Home
              </a>
            </li>
            <li className="text-sm text-gray-800 dark:text-white/90">/ Add Schedule Slot</li>
          </ol>
        </nav>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">{errorMsg}</div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">Slot details</h2>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Start time <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="08"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Start AM/PM
                </label>
                <select
                  className={inputClass}
                  value={startAmPM}
                  onChange={(e) => setStartAmPM(e.target.value)}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  End time <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="10"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  End AM/PM
                </label>
                <select
                  className={inputClass}
                  value={endAmPM}
                  onChange={(e) => setEndAmPM(e.target.value)}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Status
              </label>
              <select
                className={inputClass}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Save
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
