"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { motion } from "framer-motion";
import useApi, { ApiResponse } from "@/utils/useApi";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";

interface SignupResponse {
  [key: string]: string;
}

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refSlug =
    searchParams.get("refSlug") || searchParams.get("slug") || "";

  // 🔐 Redirect if already logged in
  useEffect(() => {
    const token =
      localStorage.getItem("token") ||
      document.cookie
        .split(";")
        .find((c) => c.trim().startsWith("token="))
        ?.split("=")[1];

    if (token) router.push("/");
  }, [router]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    emergencyname: "",
    emergencyNumber: "",
    vetName: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { sendData, loading, updateParams } = useApi({
    url: "/api/users",
    type: "manual",
    requiresAuth: false,
  });

  useEffect(() => {
    updateParams({ slug: refSlug });
  }, [refSlug]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    // clear only that field error
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        fd.append(key, value);
      });

      const res = await sendData<ApiResponse<SignupResponse>>(fd, undefined, "POST");

      if (res.code === 200) {
        toast.success("Account created successfully");
        router.push("/");
      } 
      else if (res.code === 400) {
        setErrors(res.data ?? {});
        toast.error(res.message || "Validation failed");
      } 
      else {
        toast.error(res.message || "Something went wrong");
      }

    } catch (err: any) {
      toast.error(err?.message || "Server error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-2xl shadow-2xl p-6 mb-6"
    >
      <div className="text-center mb-10">
        <div className="mx-auto w-16 h-16 bg-[var(--primary-theme)] rounded-full flex items-center justify-center mb-4 shadow-lg">
          <KeyRound className="text-white" size={32} />
        </div>
        <h1 className="text-3xl font-bold gradient-text">Sign Up</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="refSlug" value={refSlug} />
        {Object.values(errors).filter(Boolean).length > 0 && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm space-y-1">
            {Object.values(errors)
              .filter(Boolean)
              .map((err, idx) => (
                <div key={idx}>• {err}</div>
              ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              error={!!errors.name}
              hint={errors.name}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={!!errors.email}
              hint={errors.email}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Mobile Number</label>
            <Input
              name="mobileNumber"
              value={form.mobileNumber}
              onChange={handleChange}
              error={!!errors.mobileNumber}
              hint={errors.mobileNumber}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Emergency Contact Name</label>
            <Input
              name="emergencyname"
              value={form.emergencyname}
              onChange={handleChange}
              error={!!errors.emergencyname}
              hint={errors.emergencyname}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Emergency Contact Phone</label>
            <Input
              name="emergencyNumber"
              value={form.emergencyNumber}
              onChange={handleChange}
              error={!!errors.emergencyNumber}
              hint={errors.emergencyNumber}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Country</label>
            <Input
              name="country"
              value={form.country}
              onChange={handleChange}
              error={!!errors.country}
              hint={errors.country}
            />
          </div>

          <div>
            <label className="text-sm font-medium">State</label>
            <Input
              name="state"
              value={form.state}
              onChange={handleChange}
              error={!!errors.state}
              hint={errors.state}
            />
          </div>

          <div>
            <label className="text-sm font-medium">City</label>
            <Input
              name="city"
              value={form.city}
              onChange={handleChange}
              error={!!errors.city}
              hint={errors.city}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Postal Code</label>
            <Input
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              error={!!errors.postalCode}
              hint={errors.postalCode}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Street Address</label>
            <Input
              name="streetAddress"
              value={form.streetAddress}
              onChange={handleChange}
              error={!!errors.streetAddress}
              hint={errors.streetAddress}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Vet Name</label>
            <Input
              name="vetName"
              value={form.vetName}
              onChange={handleChange}
              error={!!errors.vetName}
              hint={errors.vetName}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              error={!!errors.password}
              hint={errors.password}
            />
          </div>

        </div>

        <Button type="submit" className="w-full" loading={loading}>
          Create Account
        </Button>
      </form>
    </motion.div>
  );
}
