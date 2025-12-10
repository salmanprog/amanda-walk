"use client";
import { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import useApi from "@/utils/useApi";

export default function AddEmployee() {
  const router = useRouter();

  // Set page title
  useEffect(() => {
    document.title = "Admin | Add Employee";
  }, []);

  const [name, setName] = useState("");
    const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [roleId, setRoleId] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [status, setStatus] = useState("1");
  const [errorMsg, setErrorMsg] = useState("");

  // Submit Blog API
  const { sendData, loading } = useApi({
    url: "/api/admin/employee",
    type: "manual",
    requiresAuth: true,
  }); 

  const submitEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name) return setErrorMsg("Employee name is required.");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("status", status);
      if (image) formData.append("image", image);

      const res = await sendData(formData, undefined, "POST");

      if (res.code === 200) {
        router.push("/admin/employee");
      } else {
        //setErrorMsg(res.message || "Something went wrong.");
        const validationErrors = Object.values(res.data).join(", ");
  setErrorMsg(validationErrors);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An error occurred. Try again.");
    }
  };

  return (
    <div className="p-4 mx-auto md:p-6">

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Add Employee
        </h2>

        <nav>
          <ol className="flex items-center gap-1.5">
            <li>
              <a
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
                href="/admin"
              >
                Home
                <svg className="stroke-current" width="17" height="16">
                  <path
                    d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                    strokeWidth="1.2"
                  />
                </svg>
              </a>
            </li>

            <li className="text-sm text-gray-800 dark:text-white/90">Add Employee</li>
          </ol>
        </nav>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Form */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">
            Employee Details
          </h2>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={submitEmployee} className="space-y-5">

            {/* Blog Title */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Employee Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter employee name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs
                bg-transparent border-gray-300 focus:border-brand-300
                dark:bg-gray-900 dark:text-white dark:border-gray-700"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs
                bg-transparent border-gray-300 focus:border-brand-300
                dark:bg-gray-900 dark:text-white dark:border-gray-700"
              ></input>
              </div>

            {/* Mobile Number */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs
                bg-transparent border-gray-300 focus:border-brand-300
                dark:bg-gray-900 dark:text-white dark:border-gray-700"
              />
            </div>
              {/* Employee Image */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Employee Image
              </label>

              <label className="group block cursor-pointer rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-800 p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImage(e.target.files[0]);
                    }
                  }}
                />

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-800 dark:text-white">
                    Click to upload
                  </span>{" "}
                  or drag & drop
                </p>

                {image && (
                  <p className="text-xs text-green-600 mt-2">{image.name}</p>
                )}
              </label>
            </div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-11 w-full rounded-lg border px-4 py-2.5 shadow-theme-xs
                bg-transparent border-gray-300 dark:bg-gray-900 dark:text-white"
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" loading={loading}>
                Save Employee
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

