"use client";

import { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";



export default function LoginForm() {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.email || !form.password) {
            toast.error("Email and password are required");
            return;
        }
        setLoading(true);
        setError(null);

        try {
            console.log(form.email, form.password);

            await new Promise((res) => setTimeout(res, 1000));

            toast.success("Login successful");
            router.push("/add-pets");
        } catch (err) {
            setError("Invalid credentials");
        } finally {
            setLoading(false);
        }

    };

    return (
        <div className="">
            <div className="text-center mb-10">
                <div className="mx-auto w-16 h-16 bg-[var(--primary-theme)] rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <KeyRound className="text-white" size={32} />
                </div>
                <h1 className="text-3xl font-bold text-center mb-6 gradient-text">
                    Login
                </h1>
            </div>

            {error && (
                <div className="mb-4 text-red-600 text-sm">
                    {error}
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
                        required
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
                        required
                        value={form.password}
                        onChange={handleChange}
                    />
                </div>
                <Button variant="secondary" className="w-full" type="submit" loading={loading}>
                    Login
                </Button>
                <div className="flex gap-2">
                    <span>Don't have an Account</span>
                    <Link href="/signup" className="gradient-text font-bold">
                        SignUp
                    </Link>
                </div>
            </form>
        </div>
    );
}
