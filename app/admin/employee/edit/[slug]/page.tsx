"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "@/components/ui/button/Button";
import useApi from "@/utils/useApi";

type SelectedCategory = {
  categoryId: string;
  services: string[];
};

export default function EditEmployee() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  /* ================= BASIC STATES ================= */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("1");
  const [image, setImage] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  /* ================= SERVICES STATES ================= */
  const [selectedCategories, setSelectedCategories] = useState<SelectedCategory[]>([]);
  const [servicesByCategory, setServicesByCategory] = useState<Record<string, any[]>>({});
  const [loadingServices, setLoadingServices] = useState<Record<string, boolean>>({});
  const [servicesReady, setServicesReady] = useState(false);

  // for sequential loading (IMPORTANT)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [pendingCategoryIds, setPendingCategoryIds] = useState<string[]>([]);

  /* ================= FETCH EMPLOYEE ================= */
  const {
    data: employeeData,
    fetchApi: fetchEmployee,
    loading: employeeLoading,
  } = useApi({
    url: `/api/admin/employee/${slug}`,
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  /* ================= FETCH CATEGORIES ================= */
  const {
    data: serviceCategories,
    fetchApi: fetchCategories,
  } = useApi({
    url: "/api/admin/service-category",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  /* ================= FETCH SERVICES (AS YOU REQUESTED) ================= */
  const {
    data: servicesData,
    fetchApi: fetchServicesApi,
  } = useApi({
    url: activeCategoryId
      ? `/api/admin/service?cat_id=${activeCategoryId}`
      : "",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  /* ================= UPDATE EMPLOYEE ================= */
  const { sendData, loading } = useApi({
    url: `/api/admin/employee/${slug}`,
    type: "manual",
    requiresAuth: true,
  });

  /* ================= PAGE LOAD ================= */
  useEffect(() => {
    document.title = "Admin | Edit Employee";
    fetchEmployee();
    fetchCategories();
  }, [slug]);

  /* ================= PREFILL EMPLOYEE DATA ================= */
  useEffect(() => {
    if (!employeeData) return;

    setName(employeeData.name || "");
    setEmail(employeeData.email || "");
    setStatus(employeeData.status ? "1" : "0");

    if (employeeData.employeeservices?.length) {
      const grouped: SelectedCategory[] = [];

      employeeData.employeeservices.forEach((s: any) => {
        let cat = grouped.find(
          (c) => c.categoryId === String(s.serviceCategoryId)
        );

        if (!cat) {
          cat = { categoryId: String(s.serviceCategoryId), services: [] };
          grouped.push(cat);
        }

        cat.services.push(String(s.serviceId));
      });

      setSelectedCategories(grouped);

      // queue all category ids for service loading
      const ids = grouped.map((g) => g.categoryId);
      setPendingCategoryIds(ids);
      setActiveCategoryId(ids[0] ?? null);
      setServicesReady(false);
    } else {
      setServicesReady(true);
    }
  }, [employeeData]);

  /* ================= LOAD SERVICES SEQUENTIALLY ================= */
  useEffect(() => {
    if (!activeCategoryId) return;

    setLoadingServices((p) => ({ ...p, [activeCategoryId]: true }));
    fetchServicesApi(); // ❗ no args (important)
  }, [activeCategoryId]);

  /* ================= STORE SERVICES + FINAL READY SIGNAL ================= */
  useEffect(() => {
    if (!activeCategoryId || !Array.isArray(servicesData)) return;

    setServicesByCategory((prev) => ({
      ...prev,
      [activeCategoryId]: servicesData,
    }));

    // 🔥 force re-evaluation of checked state
    setSelectedCategories((prev) =>
      prev.map((cat) =>
        cat.categoryId === activeCategoryId ? { ...cat } : cat
      )
    );

    setLoadingServices((prev) => ({
      ...prev,
      [activeCategoryId]: false,
    }));

    // move to next category
    setPendingCategoryIds((prev) => {
      const remaining = prev.filter((id) => id !== activeCategoryId);

      if (remaining.length === 0) {
        setActiveCategoryId(null);
        setServicesReady(true); // ✅ THIS FIXES FIRST-LOAD BUG
      } else {
        setActiveCategoryId(remaining[0]);
      }

      return remaining;
    });
  }, [servicesData]);

  /* ================= CATEGORY CHANGE (USER CLICK) ================= */
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories((p) =>
        p.find((c) => c.categoryId === categoryId)
          ? p
          : [...p, { categoryId, services: [] }]
      );

      if (!servicesByCategory[categoryId]) {
        setPendingCategoryIds((p) => [...p, categoryId]);
        setActiveCategoryId(categoryId);
        setServicesReady(false);
      }
    } else {
      setSelectedCategories((p) =>
        p.filter((c) => c.categoryId !== categoryId)
      );
    }
  };

  /* ================= SERVICE CHANGE ================= */
  const handleServiceChange = (
    categoryId: string,
    serviceId: string,
    checked: boolean
  ) => {
    setSelectedCategories((p) =>
      p.map((cat) =>
        cat.categoryId === categoryId
          ? {
              ...cat,
              services: checked
                ? [...cat.services, serviceId]
                : cat.services.filter((id) => id !== serviceId),
            }
          : cat
      )
    );
  };

  /* ================= SUBMIT ================= */
  const submitEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name) return setErrorMsg("Employee name is required.");
    if (!selectedCategories.length)
      return setErrorMsg("Select at least one service.");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    if (password) formData.append("password", password);
    formData.append("status", status);
    if (image) formData.append("image", image);
    formData.append("serviceCategories", JSON.stringify(selectedCategories));

    const res = await sendData(formData, undefined, "PATCH");

    if (res?.code === 200) {
      router.push("/admin/employee");
    } else {
      setErrorMsg(res?.message || "Update failed");
    }
  };

  if (employeeLoading) return <div>Loading employee...</div>;

  /* ================= UI ================= */
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Edit Employee</h2>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errorMsg}
        </div>
      )}

      <form onSubmit={submitEmployee} className="space-y-4">
        <input
          className="border p-2 w-full"
          placeholder="Employee Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2 w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {!servicesReady ? (
          <div className="text-sm text-gray-400">
            Loading employee services...
          </div>
        ) : (
          serviceCategories?.map((cat: any) => {
            const selected = selectedCategories.find(
              (c) => c.categoryId === String(cat.id)
            );

            return (
              <div key={cat.id}>
                <label className="font-medium">
                  <input
                    type="checkbox"
                    checked={!!selected}
                    onChange={(e) =>
                      handleCategoryChange(String(cat.id), e.target.checked)
                    }
                  />{" "}
                  {cat.title}
                </label>

                {loadingServices[cat.id] && (
                  <div className="ml-4 text-sm text-gray-400">
                    Loading services...
                  </div>
                )}

                {selected &&
                  servicesByCategory[cat.id]?.map((srv: any) => (
                    <label key={srv.id} className="ml-4 block">
                      <input
                        type="checkbox"
                        checked={selected.services.includes(String(srv.id))}
                        onChange={(e) =>
                          handleServiceChange(
                            String(cat.id),
                            String(srv.id),
                            e.target.checked
                          )
                        }
                      />{" "}
                      {srv.serviceTitle || srv.title}
                    </label>
                  ))}
              </div>
            );
          })
        )}

        <Button type="submit" loading={loading}>
          Update Employee
        </Button>
      </form>
    </div>
  );
}
