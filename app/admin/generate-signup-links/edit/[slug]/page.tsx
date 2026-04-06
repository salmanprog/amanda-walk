"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import useApi, { type ApiResponse } from "@/utils/useApi";
import { useParams, useRouter } from "next/navigation";

export default function EditGenerateSignupLink() {
  const router = useRouter();
  const params = useParams();
  const slugParam = decodeURIComponent(String(params?.slug ?? ""));

  useEffect(() => {
    document.title = "Admin | Edit Signup Link";
  }, []);

  const [slugLabel, setSlugLabel] = useState("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("1");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: linkData, fetchApi: fetchLink } = useApi({
    url: `/api/admin/generate-signup-links/${encodeURIComponent(slugParam)}`,
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  const { sendData, loading } = useApi({
    url: `/api/admin/generate-signup-links/${encodeURIComponent(slugParam)}`,
    method: "PATCH",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    if (slugParam) void fetchLink();
  }, [slugParam]);

  useEffect(() => {
    if (linkData && typeof linkData === "object") {
      const s = linkData as Record<string, unknown>;
      setSlugLabel(String(s.slug ?? ""));
      setUrl(String(s.url ?? ""));
      setStatus(s.status === true ? "1" : "0");
    }
  }, [linkData]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!url.trim()) return setErrorMsg("URL is required.");

    try {
      const res = await sendData<ApiResponse>(
        { url: url.trim(), status },
        undefined,
        "PATCH"
      );

      if (res.code === 200) {
        router.push("/admin/generate-signup-links");
      } else {
        setErrorMsg(res.message || "Something went wrong.");
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Update failed. Try again."
      );
    }
  };

  const inputClass =
    "h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs bg-transparent border-gray-300 focus:border-brand-300 dark:bg-gray-900 dark:text-white dark:border-gray-700";

  return (
    <div className="p-4 mx-auto md:p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Edit Signup Link
        </h2>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
          {errorMsg}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            Link details
          </h3>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={submit} className="space-y-5">

            <div>
              <label className="block mb-1 text-sm font-medium">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={inputClass}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Status</label>
              <select
                className={inputClass}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Update
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
