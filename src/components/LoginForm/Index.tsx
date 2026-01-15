"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import useApi, { ApiResponse } from "@/utils/useApi";

interface LoginResponse {
  apiTokens?: { apiToken: string }[];
  message?: string;
}

export default function LoginForm() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token") || document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
    if (token) {
      router.push("/add-pets");
    }
  }, [router]);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errorMsg, setErrorMsg] = useState("");

  const { sendData, loading } = useApi({
    url: "/api/users/login",
    type: "manual",
    requiresAuth: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const fd = new FormData();
      fd.append("email", form.email);
      fd.append("password", form.password);

      const res = await sendData<ApiResponse<LoginResponse>>(fd, undefined, "POST");

      if (res.code === 200 && res.data?.apiTokens?.[0]?.apiToken) {
        const token = res.data.apiTokens[0].apiToken;
        localStorage.setItem("token", token);

        toast.success("Login successful");
        // router.replace("/add-pets");
        // router.refresh();
        window.location.href = "/add-pets";
      } else {
        setErrorMsg(res.message || "Credentials do not match our records.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div>
      <div className="text-center mb-10">
        <div className="mx-auto w-16 h-16 bg-[var(--primary-theme)] rounded-full flex items-center justify-center mb-4 shadow-lg">
          <KeyRound className="text-white" size={32} />
        </div>
        <h1 className="text-3xl font-bold mb-6 gradient-text">
          Login
        </h1>
      </div>

      {errorMsg && (
        <div className="mb-4 text-red-600 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Password
          </label>
          <Input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <Button
          variant="secondary"
          className="w-full"
          type="submit"
          loading={loading}
        >
          {loading ? "Signing in..." : "Login"}
        </Button>

        <div className="flex gap-2 text-sm">
          <span>Don't have an account?</span>
          <Link href="/signup" className="gradient-text font-bold">
            Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
}
