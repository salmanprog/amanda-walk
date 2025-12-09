"use client";

import { useState, useEffect } from "react";
import Input from "@/components/form/input/InputField";
import Link from "next/link";
import InnerBanner from "@/components/common/InnerBanner";
import useApi, { ApiResponse } from "@/utils/useApi";
import { useRouter } from "next/navigation";

interface SignupResponse {
  [key: string]: string;
}

export default function SignUpPage() {
  const router = useRouter();
  useEffect(() => {
    document.title = "My Waldo | Sign Up";
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token") || document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
    if (token) {
      router.push("/");
    }
  }, [router]);
  const [form, setForm] = useState({
    name: "",
    lname: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { sendData, loading } = useApi({
    url: "/api/users",
    type: "manual",
    requiresAuth: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = "First name is required";
    if (!form.lname.trim()) newErrors.lname = "Last name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.mobileNumber.trim()) newErrors.mobileNumber = "Phone is required";

    if (!form.password) newErrors.password = "Password is required";
    if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!form.confirmPassword)
      newErrors.confirmPassword = "Please confirm password";

    if (form.confirmPassword !== form.password)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!validateForm()) return;

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("lname", form.lname);
      fd.append("mobileNumber", form.mobileNumber);
      fd.append("password", form.password);

      const res = await sendData<ApiResponse<SignupResponse>>(fd, undefined, "POST");

        if (res.code === 200) {
            setSuccessMsg("Thanks for registering! Please login with your credentials.");
        }

        else if (res.code === 422) {
        setErrors(res.data ?? {});        // ✔ TS Safe
        setErrorMsg(res.message || "Validation failed");
        }

        else {
        setErrorMsg(res.message || "Something went wrong.");
        }
    } catch (err: any) {
      setErrorMsg(err?.message || "Server error. Try again.");
    }
  };

  return (
    <>
      <InnerBanner title="Signup" bannerClass="signup-banner auth-banner" />

      <section className="py-20">
        <div className="container">
          <div className="max-w-[40rem] mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-3xl font-bold text-center mb-2">
                Create Your Account
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {successMsg && (
                        <div className="bg-green-100 text-green-700 p-3 rounded-md text-sm font-medium mb-3">
                            {successMsg}
                        </div>
                    )}
                {errorMsg && (
                        <div className="text-sm text-red-500 font-medium mb-3">{errorMsg}</div>
                    )}
                    {Object.values(errors).length > 0 && (
                        <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm space-y-1 mb-4">
                        {Object.values(errors).map((err, idx) => (
                            <div key={idx}>• {err}</div>
                        ))}
                        </div>
                )}

                <Input
                  name="name"
                  placeholder="First Name"
                  value={form.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  hint={errors.name}
                />

                <Input
                  name="lname"
                  placeholder="Last Name"
                  value={form.lname}
                  onChange={handleChange}
                  error={!!errors.lname}
                  hint={errors.lname}
                />


                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  hint={errors.email}
                />

                <Input
                  name="mobileNumber"
                  type="tel"
                  placeholder="Mobile Number"
                  value={form.mobileNumber}
                  onChange={handleChange}
                  error={!!errors.mobileNumber}
                  hint={errors.mobileNumber}
                />

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    hint={errors.password}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    👁️
                  </span>
                </div>

                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    error={!!errors.confirmPassword}
                    hint={errors.confirmPassword}
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    👁️
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Sign Up"}
                </button>

                <p className="text-center text-sm text-gray-600 mt-6">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-700 font-semibold">
                    Sign In
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
