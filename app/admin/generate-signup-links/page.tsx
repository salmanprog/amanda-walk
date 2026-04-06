"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import Button from "@/components/ui/button/Button";
import useApi from "@/utils/useApi";
import Badge from "@/components/ui/badge/Badge";
import ActionMenu from "@/components/ui/dropdown/ActionMenu";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";

interface GenerateSignupLinkRow {
  id: number;
  slug: string;
  url: string;
  status: boolean;
}

function signupShareUrl(slug: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  const query = `slug=${encodeURIComponent(slug)}`;
  return base ? `${base}/signup?${query}` : `/signup?${query}`;
}

export default function GenerateSignupLinksList() {
  const [rows, setRows] = useState<GenerateSignupLinkRow[]>([]);
  const deleteModal = useModal();
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  const { data, loading, fetchApi } = useApi({
    url: "/api/admin/generate-signup-links",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    document.title = "Admin | Generate Signup Links";
  }, []);

  useEffect(() => {
    void fetchApi();
  }, []);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setRows(data as GenerateSignupLinkRow[]);
    }
  }, [data]);

  const handleDelete = async () => {
    if (!deleteSlug) return;
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") ||
          sessionStorage.getItem("token") ||
          ""
        : "";
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const path = `/api/admin/generate-signup-links/${encodeURIComponent(deleteSlug)}`;
    await fetch(`${baseUrl}${path}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    deleteModal.closeModal();
    setDeleteSlug(null);
    void fetchApi();
  };

  return (
    <>
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
            Are you sure you want to delete this signup link?
            <br />
            This action cannot be undone.
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={deleteModal.closeModal}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
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
              Generate Signup Links
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/generate-signup-links/add">
              <Button>Add Signup Link</Button>
            </Link>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
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
                  Slug
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Signup link
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                    Loading signup links...
                  </TableCell>
                </TableRow>
              ) : rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {row.id}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {row.slug}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm max-w-xs truncate dark:text-gray-400">
                      {signupShareUrl(row.slug)}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color={row.status ? "success" : "warning"}>
                        {row.status ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <ActionMenu
                        editUrl={`/admin/generate-signup-links/edit/${encodeURIComponent(row.slug)}`}
                        onDelete={() => {
                          setDeleteSlug(row.slug);
                          deleteModal.openModal();
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                    No signup links found.
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
