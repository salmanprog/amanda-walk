"use client";
import { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import { useParams, useRouter } from "next/navigation";
import useApi from "@/utils/useApi";

export default function EditEmployeeService() {
  const router = useRouter();
  const { slug } = useParams();

  // Page Title
  useEffect(() => {
    document.title = "Admin | Edit Employee Service";
  }, []);

  const [errorMsg, setErrorMsg] = useState("");

  // Form States
  const [serviceCategoryId, setServiceCategoryId] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const [categoryTitle, setCategoryTitle] = useState("");
  const [serviceTitle, setServiceTitle] = useState("");
  const [servicePrice, setServicePrice] = useState("");

  // ==============================
  // 1. Fetch Employee Service (edit data)
  // ==============================
  const { data: employeeService, fetchApi: fetchEmployeeService } = useApi({
    url: `/api/admin/employee-services/${slug}`,
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    fetchEmployeeService();
  }, [slug]);

  // ==============================
  // 2. Fetch Global Data (Categories + Employees)
  // ==============================
  const { data: serviceCategories, fetchApi: fetchServiceCategories } = useApi({
    url: "/api/admin/service-category",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

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

  useEffect(() => {
  if (!serviceCategoryId || !serviceCategories?.length) return;

  const cat = serviceCategories.find(
    (c: any) => String(c.id) === String(serviceCategoryId)
  );

  if (cat) {
    setCategoryTitle(cat.title || "");
  }
}, [serviceCategoryId, serviceCategories]);

  // ==============================
  // 3. Load Services when Category Changes
  // ==============================
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
  // ==============================
  // 4. Auto-fill EmployeeService data into form
  // ==============================
   useEffect(() => {
    if (servicesData) {
      setServices(servicesData);
    }
  }, [servicesData]);

  useEffect(() => {
    if (!employeeService) return;

    const d = employeeService;

    setSelectedEmployeeId(String(d.userId));
    setServiceCategoryId(String(d.serviceCategoryId));

    // service tab select baad mein hoga
    setSelectedServiceId(String(d.serviceId));

    setServiceTitle(d.serviceTitle || "");
    setServicePrice(d.servicePrice || "");
  }, [employeeService]);
  // ==============================
  // 5. Auto-select service AFTER services load
  // ==============================
  useEffect(() => {
    if (!services.length || !employeeService) return;

    const d = employeeService;

    const srv = services.find(
      (s) => String(s.id) === String(d.serviceId)
    );

    if (!srv) return;

    setSelectedServiceId(String(srv.id));
    setServiceTitle(srv.serviceTitle || srv.title || "");
    setServicePrice(srv.servicePrice || 0);
  }, [services, employeeService]);

  // ==============================
  // 6. Submit Form
  // ==============================
  const { sendData, loading } = useApi({
    url: `/api/admin/employee-services/${slug}`,
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
      formData.append("serviceCategoryId", serviceCategoryId);
      formData.append("serviceId", selectedServiceId);
      formData.append("serviceCategoryTitle", categoryTitle);
      formData.append("serviceTitle", serviceTitle);
      formData.append("servicePrice", Number(servicePrice).toString());
      
      const res = await sendData(formData, undefined, "PATCH");

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
          Edit Employee Service
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
                  <path d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366" strokeWidth="1.2" />
                </svg>
              </a>
            </li>

            <li className="text-sm text-gray-800 dark:text-white/90">
              Edit Employee Service
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
            Employee Service Details
          </h2>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={submitEmployee} className="space-y-5">

            {/* Employee */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Employee *</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="h-11 w-full rounded-lg border px-4 py-2.5 dark:bg-gray-900 dark:text-white"
              >
                <option value="">Select Employee</option>
                {employees?.map((emp: any) => (
                  <option key={emp.id} value={emp.id.toString()}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Category */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Service Category *</label>
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
                    setServicePrice("0");
                    setServices([]);
                  }}
                  className="h-11 w-full rounded-lg border px-4 py-2.5 dark:bg-gray-900 dark:text-white"
                >
                <option value="">Select Category</option>
                {serviceCategories?.map((cat: any) => (
                  <option key={cat.id} value={cat.id.toString()}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Services */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Services *</label>
              <select
                value={selectedServiceId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedServiceId(id);

                  const srv = services.find((s: any) => s.id.toString() === id);
                  if (srv) {
                    setServiceTitle(srv.serviceTitle || srv.title);
                    setServicePrice(srv.servicePrice || 0);
                  }
                }}
                className="h-11 w-full rounded-lg border px-4 py-2.5 dark:bg-gray-900 dark:text-white"
              >
                <option value="">Select Service</option>
                {services.map((srv: any) => (
                  <option key={srv.id} value={srv.id.toString()}>
                    {srv.serviceTitle || srv.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Read-only fields */}
            <div>
              <label>Service Category Title</label>
              <input className="h-11 w-full border rounded-lg px-4 dark:bg-gray-800" value={categoryTitle} readOnly />
            </div>

            <div>
              <label>Service Title</label>
              <input className="h-11 w-full border rounded-lg px-4 dark:bg-gray-800" value={serviceTitle} readOnly />
            </div>

            <div>
              <label>Service Price</label>
              <input className="h-11 w-full border rounded-lg px-4 dark:bg-gray-800" value={servicePrice} readOnly />
            </div>

            {/* Buttons */}
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
