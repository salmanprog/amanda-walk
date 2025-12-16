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

  const [errorMsg, setErrorMsg] = useState("");
  const [serviceCategoryId, setServiceCategoryId] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedService, setSelectedService] = useState<any>(null);

  const [categoryTitle, setCategoryTitle] = useState("");
  const [serviceTitle, setServiceTitle] = useState("");
  const [servicePrice, setServicePrice] = useState("");

  // Fetch Service Categories
  const { data: serviceCategories, fetchApi: fetchServiceCategories } = useApi({
    url: "/api/admin/service-category",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  // Fetch Employees
  const { data: employees, fetchApi: fetchEmployees } = useApi({
    url: "/api/admin/employee",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });
  useEffect(() => {
    fetchServiceCategories();
    fetchEmployees();
  }, []);

  // Fetch Services when Category changes
  const { data: servicesData, fetchApi: fetchServicesData } = useApi({
    url: `/api/admin/service?cat_id=${serviceCategoryId}`,
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });
  useEffect(() => {
    if (!serviceCategoryId) return;
    fetchServicesData();
  }, [serviceCategoryId]);
  useEffect(() => {
    if (servicesData) {
      setServices(servicesData);
    }
  }, [servicesData]);

    

  // Submit Employee
  const { sendData, loading } = useApi({
    url: "/api/admin/employee-services",
    type: "manual",
    requiresAuth: true,
  });

  const submitEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedEmployeeId) return setErrorMsg("Employee is required.");
    if (!serviceCategoryId) return setErrorMsg("Service Category is required.");
    if (!selectedServiceId) return setErrorMsg("Service is required.");

    try {
      const formData = new FormData();
      formData.append("userId", selectedEmployeeId);
      formData.append("serviceCategoryId", serviceCategoryId);
      formData.append("serviceId", selectedServiceId);
      formData.append("serviceCategoryTitle", categoryTitle);
      formData.append("serviceTitle", serviceTitle);
      formData.append("servicePrice", servicePrice);

      const res = await sendData(formData, undefined, "POST");

      if (res.code === 200) {
        router.push("/admin/employee-services");
      } else {
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
          Add Employee Service
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

            <li className="text-sm text-gray-800 dark:text-white/90">
              Add Employee Service
            </li>
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
            {/* Employee */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="h-11 w-full rounded-lg border px-4 py-2.5 shadow-theme-xs
                bg-transparent border-gray-300 dark:bg-gray-900 dark:text-white"
              >
                <option value="">Select Employee</option>

                {employees?.map((employee: any) => (
                  <option key={employee.id} value={employee.id.toString()}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Service Category */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Service Category <span className="text-red-500">*</span>
              </label>
              <select
                  value={serviceCategoryId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setServiceCategoryId(id);

                    const cat = serviceCategories?.find(
                      (c: any) => String(c.id) === String(id)
                    );

                    setCategoryTitle(cat?.title || "");

                    // category change ho to service reset karna best practice
                    setSelectedServiceId("");
                    setServiceTitle("");
                    setServicePrice("");
                    setServices([]);
                  }}
                  className="h-11 w-full rounded-lg border px-4 py-2.5 dark:bg-gray-900 dark:text-white"
                >
                <option value="">Select Service Category</option>

                {serviceCategories?.map((category: any) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Services */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Services <span className="text-red-500">*</span>
              </label>

              <select
                  value={selectedServiceId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedServiceId(id);

                    const service = services.find((s: any) => s.id.toString() === id);

                    if (service) {
                      setSelectedService(service);
                      setServiceTitle(service.serviceTitle || service.title || "");
                      setServicePrice(service.servicePrice || "0");
                    }
                  }}
                  className="h-11 w-full rounded-lg border px-4 py-2.5 shadow-theme-xs
                  bg-transparent border-gray-300 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">Select Services</option>

                  {services.length > 0 ? (
                    services.map((service: any) => (
                      <option key={service.id} value={service.id}>
                        {service.serviceTitle || service.title}
                      </option>
                    ))
                  ) : (
                    <option disabled>No services found</option>
                  )}
                </select>
            </div>
            {/* Category Title */}
            <div>
              <label className="block mb-1.5 text-sm font-medium dark:text-gray-400">
                Service Category Title
              </label>
              <input
                type="text"
                value={categoryTitle}
                readOnly
                className="h-11 w-full rounded-lg border px-4 py-2.5 bg-gray-100 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Service Title */}
            <div>
              <label className="block mb-1.5 text-sm font-medium dark:text-gray-400">
                Service Title
              </label>
              <input
                type="text"
                value={serviceTitle}
                readOnly
                className="h-11 w-full rounded-lg border px-4 py-2.5 bg-gray-100 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Service Price */}
            <div>
              <label className="block mb-1.5 text-sm font-medium dark:text-gray-400">
                Service Price
              </label>
              <input
                type="text"
                value={servicePrice}
                readOnly
                className="h-11 w-full rounded-lg border px-4 py-2.5 bg-gray-100 dark:bg-gray-800 dark:text-white"
              />
            </div>
            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Save Employee Service
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
