"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useApi from "@/utils/useApi";
import Image from "next/image";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Link from "next/link";
import { EmployeeServices } from "@prisma/client";

interface EmployeeDetails {
  id: number;
  slug: string;
  name: string | null;
  email: string | null;
  mobileNumber: string | null;
  imageUrl: string | null;
  dob: string | null;
  gender: string | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  role: {
    id: number;
    title: string;
    slug: string;
  } | null;
  employeeservices: EmployeeServices[];
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  useEffect(() => {
    document.title = "Admin | Employee Details";
  }, []);

  const { data, loading, error, fetchApi } = useApi({
    url: `/api/admin/employee/${slug}`,
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  const [employee, setEmployee] = useState<EmployeeDetails | null>(null);

  useEffect(() => {
    if (slug) fetchApi();
  }, [slug]);

  useEffect(() => {
    if (data) setEmployee(data as EmployeeDetails);
  }, [data]);

  const groupedServices =
    employee?.employeeservices?.reduce((acc: Record<string, EmployeeServices[]>, service) => {
      const category = service.serviceCategoryTitle || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(service);
      return acc;
    }, {}) || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading user details...</div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error loading employee details</div>
          <Button onClick={() => router.push("/admin/employees")} variant="outline">
            Back to Employees List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Employee Details
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View detailed information about the employee
          </p>
        </div>
        <Button onClick={() => router.push("/admin/employees")} variant="outline">
          Back to List
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            {employee.imageUrl ? (
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700">
                <Image src={employee.imageUrl} alt={employee.name || "Employee"} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-gray-200 dark:border-gray-700">
                <span className="text-4xl text-gray-500 dark:text-gray-400">
                  {employee.name?.[0]?.toUpperCase() || "E"}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-2">
              {employee.name || "N/A"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Info label="User ID" value={`#${employee.id}`} />
              <Info label="Email" value={employee.email} />
              <Info label="Mobile" value={employee.mobileNumber} />
              <Info label="DOB" value={employee.dob} />
              <Info label="Gender" value={employee.gender} />
              <Info label="Role" value={employee.role?.title} />
              <Info label="Member Since" value={new Date(employee.createdAt).toLocaleDateString()} />
              <Info label="Last Updated" value={new Date(employee.updatedAt).toLocaleDateString()} />

              <div className="col-span-full">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Services
                </label>

                <ul className="mt-2 space-y-4">
                  {Object.entries(groupedServices).map(([category, services]) => (
                    <li key={category}>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {category}
                      </span>
                      <ul className="ml-4 mt-1 space-y-1">
                        {services.map(service => (
                          <li key={service.id} className="text-sm text-gray-700 dark:text-white/80">
                            {service.serviceTitle} — {service.servicePrice}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <p className="text-sm font-medium text-gray-800 dark:text-white/90 mt-1">
        {value || "N/A"}
      </p>
    </div>
  );
}
