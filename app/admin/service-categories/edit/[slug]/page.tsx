"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import useApi from "@/utils/useApi";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function EditServiceCategory() {
  const router = useRouter();
  const { slug } = useParams();

  // Set page title
  useEffect(() => {
    document.title = "Admin | Edit Service Category";
  }, []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [oldImage, setOldImage] = useState<string | null>(null);
  const [status, setStatus] = useState("1");
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch single blog
  const { data: serviceCategoryData, fetchApi: fetchServiceCategory } = useApi({
    url: `/api/admin/service-category/${slug}`,
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  // Update Blog API
  const { sendData, loading } = useApi({
    url: `/api/admin/service-category/${slug}`,
    method: "PATCH",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    fetchServiceCategory();
  }, []);

  // Fill edit form fields
  useEffect(() => {
    if (serviceCategoryData) {
      setTitle(serviceCategoryData.title ?? "");
      setDescription(serviceCategoryData.description || "");
      setSeoTitle(serviceCategoryData.seoTitle || "");
      setSeoDescription(serviceCategoryData.seoDescription || "");
      setStatus(serviceCategoryData.status ? "1" : "0");
        setOldImage(serviceCategoryData.imageUrl || null);
    }
  }, [serviceCategoryData]);

  const updateServiceCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title) return setErrorMsg("Service category title is required.");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("seoTitle", seoTitle);
      formData.append("seoDescription", seoDescription);
      formData.append("status", status);

      if (image) {
        formData.append("image", image);
      }

      const res = await sendData(formData, undefined, "PATCH");

      if (res.code === 200) {
        router.push("/admin/service-categories");
      } else {
        setErrorMsg(res.message || "Something went wrong.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Update failed. Try again.");
    }
  };

  return (
    <div className="p-4 mx-auto md:p-6">

      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Edit Service Category
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
            Service Category Details
          </h3>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={updateServiceCategory} className="space-y-5">

            {/* Title */}
            <div>
              <label className="block mb-1 text-sm font-medium">Service Category Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block mb-1 text-sm font-medium">Description</label>
              <textarea
                rows={5}
                className="w-full rounded-lg border px-4 py-2.5 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* SEO Title */}
            <div>
              <label className="block mb-1 text-sm font-medium">SEO Title</label>
              <input
                type="text"
                placeholder="Enter SEO title for search engines"
                className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
              />
            </div>

            {/* SEO Description */}
            <div>
              <label className="block mb-1 text-sm font-medium">SEO Description</label>
              <textarea
                rows={3}
                placeholder="Enter SEO description for search engines"
                className="w-full rounded-lg border px-4 py-2.5 text-sm"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
              />
            </div>

            {/* Image */}
            <div>
              <label className="block mb-1 text-sm font-medium">Service Category Image</label>

              {oldImage && !image && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Image:</p>
                  <div className="relative w-32 h-32 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                    <Image
                      src={oldImage}
                      alt="Current service category image"
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  </div>
                </div>
              )}

              <label className="cursor-pointer block border-2 border-dashed p-6 rounded-lg text-center">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setImage(e.target.files[0]);
                    }
                  }}
                />

                <p className="text-sm text-gray-500">
                  Click to upload or drag & drop
                </p>

                {image && <p className="text-xs text-green-600 mt-2">{image.name}</p>}
              </label>
              <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
            </div>

            {/* Status */}
            <div>
              <label className="block mb-1 text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-11 w-full border rounded-lg px-4 py-2.5"
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Update Service Category
              </Button>
            </div>

          </form>
        </div>
      </div>

    </div>
  );
}

