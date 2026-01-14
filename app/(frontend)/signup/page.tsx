"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";




export default function SignUpForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    refered: "",
    vetName: "",
    password: "",
    password_confirmation: "",
  });

  const refferedOptions = [
    { value: "currentcustomer", label: "Current Customer" },
    { value: "google", label: "Google" },
    { value: "localvet", label: "Local vet" },
  ];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log(form);

      await new Promise((res) => setTimeout(res, 1200));

      toast.success("Account created successfully");
      router.push("/");
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-2xl shadow-2xl p-6 mb-6">
      <div className="">
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 bg-[var(--primary-theme)] rounded-full flex items-center justify-center mb-4 shadow-lg">
            <KeyRound className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-center mb-6 gradient-text">
            Sign Up
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="">
              <label className="block text-sm font-medium mb-1">
                Name
              </label>
              <Input
                type="text"
                name="email"
                required
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="">
              <label className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="">
              <label className="block text-sm font-medium mb-1">
                Emergency Contact Name
              </label>
              <Input
                type="text"
                name="emergencyContactName"
                required
                value={form.emergencyContactName}
                onChange={handleChange}
              />
            </div>
            <div className="">
              <label className="block text-sm font-medium mb-1">
                Emergency Contact Phone
              </label>
              <Input
                type="text"
                name="emergencyContactPhone"
                required
                value={form.emergencyContactPhone}
                onChange={handleChange}
              />
            </div>
            <div className="">
              <label className="block text-sm font-medium mb-1">
                Mobile Number
              </label>
              <Input
                type="text"
                name="mobileNumber"
                required
                value={form.mobileNumber}
                onChange={handleChange}
              />
            </div>
            <div className="">
              <label className="block text-sm font-medium mb-1">
                Country
              </label>
              <Input
                type="text"
                name="country"
                required
                value={form.country}
                onChange={handleChange}
              />
            </div>
            <div className="">
              <label className="block text-sm font-medium mb-1">
                State
              </label>
              <Input
                type="text"
                name="state"
                required
                value={form.state}
                onChange={handleChange}
              />
            </div>
            <div className="">
              <label className="block text-sm font-medium mb-1">
                City
              </label>
              <Input
                type="text"
                name="city"
                required
                value={form.city}
                onChange={handleChange}
              />
            </div>
            <div className="">
              <label className="block text-sm font-medium mb-1">
                Postal Code
              </label>
              <Input
                type="text"
                name="postalCode"
                required
                value={form.postalCode}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Street Address
              </label>
              <Input
                type="text"
                name="streetAddress"
                required
                value={form.streetAddress}
                onChange={handleChange}
              />
            </div>
            <div className="">
              <label className="block text-sm font-medium mb-1">
                Select Reffered
              </label>
              <Select
                options={refferedOptions}
                placeholder="Select Referred"
                value={form.refered}
                onChange={(value) => handleSelectChange("refered", value)}
              />
            </div>
            <div className="">
              <label className="block text-sm font-medium mb-1">
                Vet Name
              </label>
              <Input
                type="text"
                name="vetName"
                required
                value={form.vetName}
                onChange={handleChange}
              />
            </div>
            <div className="">
              <label className="block text-sm font-medium mb-1">
                Password
              </label>
              <Input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <div className="">
              <label className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <Input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <Button variant="secondary" className="w-full" type="submit" loading={loading}>
            Sign Up
          </Button>
        </form>
      </div>
    </motion.div>

  )
}