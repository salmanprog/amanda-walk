"use client";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import Button from "@/components/ui/button/Button";
import useApi from "@/utils/useApi";
import Badge from "@/components/ui/badge/Badge";
import ActionMenu from "@/components/ui/dropdown/ActionMenu";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Image from "next/image";

interface ServiceCategory {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: boolean;
}

export default function ServiceCategoryList() {
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const deleteModal = useModal();
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const { data, loading, fetchApi } = useApi({
    url: "/api/admin/service-category",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  // Set page title
  useEffect(() => {
    document.title = "Admin | Service Categories";
  }, []);

  useEffect(() => {
    fetchApi();
  }, []);
  useEffect(() => {
    if (data) setServiceCategories(data);
  }, [data]);
  const handleDelete = async () => {
    if (!deleteSlug) return;

    await fetch(`/api/admin/service-category/${deleteSlug}`, {
      method: "DELETE",
    });

    deleteModal.closeModal();
    setDeleteSlug(null);
    fetchApi(); // refresh table
  };
  return (
    <>
      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        className="max-w-[450px] p-6"
      >
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
            Confirm Delete
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete this service category?  
            <br />This action cannot be undone.
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={deleteModal.closeModal}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>

            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg bg-error-500 text-white hover:bg-error-600"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Service Categories
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/service-categories/add">
            <Button>Add Service Category</Button>
            </Link>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
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
                Image
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Title
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Slug
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

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-gray-500">
                  Loading service categories...
                </TableCell>
              </TableRow>
            ) : serviceCategories.length > 0 ? (
              serviceCategories.map((serviceCategory) => (
                <TableRow key={serviceCategory.id} className="">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-[50px] w-[50px] overflow-hidden rounded-md flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        {serviceCategory.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    {serviceCategory.imageUrl ? (
                      <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                        <Image
                            src={serviceCategory.imageUrl}
                          alt={serviceCategory.title}
                          width={50}
                          height={50}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-xs text-gray-500">No Image</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {serviceCategory.title}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="max-w-xs truncate" title={serviceCategory.slug || ""}>
                      {serviceCategory.slug || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                          serviceCategory.status === true
                          ? "success"
                          : serviceCategory.status === false
                          ? "warning"
                          : "error"
                      }
                    >
                      {serviceCategory.status === true ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                <ActionMenu
                    editUrl={`/admin/service-categories/edit/${serviceCategory.slug}`}
                    onDelete={() => {
                      setDeleteSlug(serviceCategory.slug);
                      deleteModal.openModal();
                    }}
                  />
                </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-gray-500">
                  No service categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
    </>
  );
}

