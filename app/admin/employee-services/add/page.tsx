"use client";
import { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import useApi from "@/utils/useApi";

export default function AddEmployee() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Admin | Add Employee";
  }, []);

  const [errorMsg, setErrorMsg] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const [selectedCategories, setSelectedCategories] = useState<any[]>([]);
  const [servicesByCategory, setServicesByCategory] = useState<Record<string, any[]>>({});
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

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

  const {
    data: servicesData,
    fetchApi: fetchServicesData,
    loading: servicesLoading,
  } = useApi({
    url: activeCategoryId ? `/api/admin/service?cat_id=${activeCategoryId}` : "",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  useEffect(() => {
    fetchServiceCategories();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (activeCategoryId) {
      fetchServicesData();
    }
  }, [activeCategoryId]);

  useEffect(() => {
    if (activeCategoryId && Array.isArray(servicesData)) {
      setServicesByCategory((prev) => ({
        ...prev,
        [activeCategoryId]: servicesData,
      }));
    }
  }, [servicesData]);

  const handleCategoryChange = (categoryId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedCategories((prev) => {
        if (prev.find((c) => c.categoryId === categoryId)) return prev;
        return [...prev, { categoryId, services: [] }];
      });
  
      // Force re-trigger even if same ID
      setActiveCategoryId(null);
      setTimeout(() => setActiveCategoryId(categoryId), 0);
    } else {
      setSelectedCategories((prev) => prev.filter((c) => c.categoryId !== categoryId));
  
      setServicesByCategory((prev) => {
        const copy = { ...prev };
        delete copy[categoryId];
        return copy;
      });
    }
  };

  const handleServiceChange = (categoryId: string, serviceId: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      prev.map((cat) =>
        cat.categoryId === categoryId
          ? {
              ...cat,
              services: checked
                ? [...cat.services, serviceId]
                : cat.services.filter((id: string) => id !== serviceId),
            }
          : cat
      )
    );
  };

  const { sendData, loading } = useApi({
    url: "/api/admin/employee-services",
    type: "manual",
    requiresAuth: true,
  });

  const submitEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedEmployeeId) return setErrorMsg("Employee is required.");
    if (!selectedCategories.length) return setErrorMsg("Select at least one service.");
    try {
    const formData = new FormData();
    formData.append("userId", selectedEmployeeId);
    formData.append("serviceCategories", JSON.stringify(selectedCategories));
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
      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={submitEmployee} className="space-y-5">
        <div>
          <label className="block mb-1.5">Employee *</label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="h-11 w-full rounded border px-3"
          >
            <option value="">Select Employee</option>
            {employees?.map((emp: any) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1.5">Service Categories *</label>
          <div className="space-y-3">
            {serviceCategories?.map((cat: any) => (
              <div key={cat.id}>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    onChange={(e) => handleCategoryChange(cat.id.toString(), e.target.checked)}
                  />
                  {cat.title}
                </label>

                {selectedCategories.find((c) => c.categoryId === cat.id.toString()) && (
                  <div className="pl-6 space-y-2 mt-2">
                    {servicesLoading && activeCategoryId === cat.id.toString() && (
                      <div className="text-sm text-gray-400">Loading services...</div>
                    )}

                    {servicesByCategory[cat.id]?.map((service: any) => (
                      <label key={service.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedCategories
                            .find((c) => c.categoryId === cat.id.toString())
                            ?.services.includes(service.id.toString())}
                          onChange={(e) =>
                            handleServiceChange(
                              cat.id.toString(),
                              service.id.toString(),
                              e.target.checked
                            )
                          }
                        />
                        {service.serviceTitle || service.title}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit" loading={loading}>
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
