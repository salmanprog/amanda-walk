"use client";

import { useState } from "react";
import Button from "@/components/ui/button/Button";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Info, ArrowLeft, ArrowRight, HandPlatter } from "lucide-react";
import { useRouter } from "next/navigation";

// Mock data based on the screenshot
const services = [
    { id: 1, name: "Dog Walk", duration: "15 Min AM", price: "$45" },
    { id: 2, name: "Dog Walk", duration: "20 Min AM", price: "$75" },
    { id: 3, name: "Dog Walk", duration: "30 Min AM", price: "$90" },
];

export default function ServicePage() {
    const [loading, setLoading] = useState(false);
    const [selectedService, setSelectedService] = useState<number | null>(null);
    const router = useRouter();

    const handleSubmit = async () => {
        if (selectedService === null) {
            toast.error("Please select a service before submit");
            return;
        }

        setLoading(true);

        try {
            // fake API / next step delay
            await new Promise((res) => setTimeout(res, 1200));

            toast.success("Service selected successfully!");
            router.push("/appointment");
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-2xl shadow-2xl p-6 mb-6">
            <div className="text-center mb-10">
                <div className="mx-auto w-16 h-16 bg-[var(--primary-theme)] rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <HandPlatter className="text-white" size={32} />
                </div>
                <h1 className="text-3xl font-bold mb-2 gradient-text">
                    Select Your Service
                </h1>
                <p className="text-gray-500">Choose the perfect service for your pet</p>
            </div>

            {/* Service Category Section */}
            <div className="mb-8">
                <h2 className="text-sm font-bold text-gray-700 mb-6">Service Category</h2>
                <div className="flex justify-center">
                    <div className="w-48 h-40 bg-white border-2 border-indigo-200 rounded-2xl shadow-sm flex flex-col items-center justify-center relative cursor-pointer hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 rounded-full bg-[#A855F7] flex items-center justify-center mb-3 shadow-inner">
                            <Sparkles className="text-white" size={28} />
                        </div>
                        <span className="font-bold text-[#1E293B]">Dog Walk</span>
                        <div className="mt-2 bg-gradient rounded-full p-0.5">
                            <Check size={14} className="text-white" strokeWidth={3} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Select Service Section */}
            <div className="mb-10">
                <h2 className="text-sm font-bold text-gray-700 mb-4">Select Service</h2>
                <div className="space-y-4">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            onClick={() => setSelectedService(service.id)}
                            className={`
                                relative p-5 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center bg-white group
                                ${selectedService === service.id
                                    ? "border-[#667eea] shadow-lg scale-[1.01]"
                                    : "border-gray-200 hover:border-indigo-200 hover:shadow-md"
                                }
                            `}
                        >
                            <div>
                                <h3 className="font-bold text-lg text-[#1E293B] group-hover:text-black">{service.name}</h3>
                                <p className="text-gray-500 text-sm font-medium">{service.duration}</p>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <span className="block text-xl font-bold text-[#1E293B]">{service.price}</span>
                                <Info size={18} className="text-gray-300 mt-1" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Button onClick={handleSubmit} variant="secondary" className="w-full" type="submit" loading={loading}>
                Submit
            </Button>
        </motion.div>
    );
}