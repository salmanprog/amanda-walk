"use client";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/button/Button";
import useApi from "@/utils/useApi";
import Badge from "@/components/ui/badge/Badge";
import ActionMenu from "@/components/ui/dropdown/ActionMenu";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";

interface EmployeeService {
  id: number;
  slug: string;
  serviceCategoryId: number;
  serviceCategoryTitle: string;
  serviceId: number;
  serviceTitle: string;
  servicePrice: string;
}

export default function UserList() {
  const [employeeServices, setEmployeeServices] = useState<EmployeeService[]>([]);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const deleteModal = useModal();
  const { data: employeeServicesData, loading, fetchApi } = useApi({
    url: "/api/admin/employee-services",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  // Set page title
  useEffect(() => {
    document.title = "Admin | Employee Services";
  }, []);

  useEffect(() => {
    fetchApi();
  }, []);
  useEffect(() => {
    if (employeeServicesData && Array.isArray(employeeServicesData)) {
      setEmployeeServices(employeeServicesData);
    }
  }, [employeeServicesData]);
  const handleDelete = async () => {
    if (!deleteSlug) return;

    await fetch(`/api/admin/employee-services/${deleteSlug}`, {
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
            Are you sure you want to delete this service?  
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
            Employee Services List
          </h3>
        </div>
        <div className="flex items-center gap-3">
            <Link href="/admin/employee-services/add">
              <Button>Add Employee Service</Button>
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
                Service Category
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
                Price
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
                <TableCell className="py-8 text-center text-gray-500">
                  Loading employee services...
                </TableCell>
              </TableRow>
              ) : employeeServices.length > 0 ? (
              employeeServices.map((employeeService) => (
                <TableRow key={employeeService.id} className="">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-200 flex items-center justify-center">
                        {employeeService.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {employeeService.serviceCategoryTitle || "N/A"}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {employeeService.serviceTitle || "N/A"}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {employeeService.servicePrice || "N/A"}
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <ActionMenu
                      editUrl={`/admin/employee-services/edit/${employeeService.slug}`}
                      onDelete={() => {
                        setDeleteSlug(employeeService.slug);  
                        deleteModal.openModal();
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="py-8 text-center text-gray-500">
                  No employee services found.
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
