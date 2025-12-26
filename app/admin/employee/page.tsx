"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/button/Button";
import useApi from "@/utils/useApi";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { useRouter } from "next/navigation";

interface Employee {
  id: number;
  name: string;
  slug: string;
  email: string;
  imageUrl: string | null;
  role: {
    id: number;
    title: string;
    slug: string;
  } | null;
}

export default function UserList() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>({});

  const { data, loading, fetchApi } = useApi({
    url: "/api/admin/employee",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  // Set page title
  useEffect(() => {
    document.title = "Admin | Employees";
  }, []);

  useEffect(() => {
    fetchApi();
  }, []);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setEmployees(data);
    }
  }, [data]);

  const toggleDropdown = (id: number) => {
    setOpenDropdowns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const closeDropdown = (id: number) => {
    setOpenDropdowns((prev) => ({ ...prev, [id]: false }));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Employees List</h3>
        <div className="flex items-center gap-3">
          <Link href="/admin/employee/add">
            <Button>Add Employee</Button>
          </Link>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ID</TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Role</TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Action</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <TableRow>
                <TableCell className="py-8 text-center text-gray-500" colSpan={5}>
                  Loading employees...
                </TableCell>
              </TableRow>
            ) : employees.length > 0 ? (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      {employee.imageUrl ? (
                        <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                          <Image
                            src={employee.imageUrl}
                            alt={employee.name || "Employee"}
                            width={50}
                            height={50}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">{employee.id}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{employee.name || "N/A"}</TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{employee.email || "N/A"}</TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{employee.role?.title || "N/A"}</TableCell>

                  <TableCell className="py-3 text-center">
                    <div className="relative dropdown">
                      <button
                        onClick={() => toggleDropdown(employee.id)}
                        className="dropdown-toggle text-gray-500 dark:text-gray-400"
                      >
                        <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.99902 10.245C6.96552 10.245 7.74902 11.0285 7.74902 11.995V12.005C7.74902 12.9715 6.96552 13.755 5.99902 13.755C5.03253 13.755 4.24902 12.9715 4.24902 12.005V11.995C4.24902 11.0285 5.03253 10.245 5.99902 10.245ZM17.999 10.245C18.9655 10.245 19.749 11.0285 19.749 11.995V12.005C19.749 12.9715 18.9655 13.755 17.999 13.755C17.0325 13.755 16.249 12.9715 16.249 12.005V11.995C16.249 11.0285 17.0325 10.245 17.999 10.245ZM13.749 11.995C13.749 11.0285 12.9655 10.245 11.999 10.245C11.0325 10.245 10.249 11.0285 10.249 11.995V12.005C10.249 12.9715 11.0325 13.755 11.999 13.755C12.9655 13.755 13.749 12.9715 13.749 12.005V11.995Z"
                          />
                        </svg>
                      </button>
                      <Dropdown
                        isOpen={!!openDropdowns[employee.id]}
                        onClose={() => closeDropdown(employee.id)}
                        className="w-40 p-2 space-y-1"
                      >
                        <DropdownItem
                          tag="button"
                          className="text-xs font-medium w-full text-left text-gray-500 dark:text-gray-400
                                    hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:hover:text-gray-300"
                          onClick={() => {
                            closeDropdown(employee.id);
                            window.location.href = `/admin/employee/edit/${employee.slug}`;
                          }}
                        >
                          Edit
                        </DropdownItem>

                        {/* Add more actions here */}
                      </Dropdown>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="py-8 text-center text-gray-500" colSpan={5}>
                  No employees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
