"use client";

import { useState } from "react";
import Button from "@/components/ui/button/Button";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Sparkles, Check, Info, HandPlatter } from "lucide-react";
import { useRouter } from "next/navigation";

// Mock services
const services = [
  { id: 1, name: "Dog Walk", duration: "15 Min AM", price: "$45" },
  { id: 2, name: "Dog Walk", duration: "20 Min AM", price: "$75" },
  { id: 3, name: "Dog Walk", duration: "30 Min AM", price: "$90" },
];

// Pets list
const pets = ["Pet 1", "Pet 2", "Pet 3"];

export default function ServicePage() {
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedPets, setSelectedPets] = useState<string[]>([]);
  const router = useRouter();

  const togglePet = (pet: string) => {
    setSelectedPets((prev) =>
      prev.includes(pet)
        ? prev.filter((p) => p !== pet)
        : [...prev, pet]
    );
  };

  const handleSubmit = async () => {
    if (selectedPets.length === 0) {
      toast.error("Please select at least one pet");
      return;
    }

    if (selectedService === null) {
      toast.error("Please select a service");
      return;
    }

    setLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 1200));
      toast.success("Service selected successfully!");
      router.push("/appointment");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-2xl shadow-2xl p-6 mb-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-[var(--primary-theme)] rounded-full flex items-center justify-center mb-4 shadow-lg">
          <HandPlatter className="text-white" size={32} />
        </div>
        <h1 className="text-3xl font-bold mb-2 gradient-text">
          Select Your Service
        </h1>
        <p className="text-gray-500">Choose the perfect service for your pet</p>
      </div>

      {/* PET CHECKBOXES */}
      <div className="mb-10">
        <h2 className="text-sm font-bold text-gray-700 mb-4 text-center">
          Select Pets
        </h2>

        <div className="flex flex-wrap justify-center gap-4">
          {pets.map((pet) => (
            <label
              key={pet}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 cursor-pointer transition-all
                ${
                  selectedPets.includes(pet)
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
            >
              <input
                type="checkbox"
                checked={selectedPets.includes(pet)}
                onChange={() => togglePet(pet)}
                className="w-5 h-5 accent-indigo-600"
              />
              <span className="font-semibold text-gray-800">{pet}</span>
            </label>
          ))}
        </div>
      </div>

      {/* SERVICE CATEGORY */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-gray-700 mb-6">
          Service Category
        </h2>

        <div className="flex justify-center">
          <div className="w-48 h-40 bg-white border-2 border-indigo-200 rounded-2xl shadow-sm flex flex-col items-center justify-center relative">
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

      {/* SERVICES LIST */}
      <div className="mb-10">
        <h2 className="text-sm font-bold text-gray-700 mb-4">
          Select Service
        </h2>

        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => setSelectedService(service.id)}
              className={`relative p-5 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center bg-white
                ${
                  selectedService === service.id
                    ? "border-indigo-500 shadow-lg scale-[1.01]"
                    : "border-gray-200 hover:border-indigo-300 hover:shadow-md"
                }`}
            >
              <div>
                <h3 className="font-bold text-lg text-[#1E293B]">
                  {service.name}
                </h3>
                <p className="text-gray-500 text-sm font-medium">
                  {service.duration}
                </p>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className="text-xl font-bold text-[#1E293B]">
                  {service.price}
                </span>
                <Info size={18} className="text-gray-300 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NEXT BUTTON */}
      <Button
        onClick={handleSubmit}
        variant="secondary"
        className="w-full"
        type="submit"
        loading={loading}
      >
        Next
      </Button>
    </motion.div>
  );
}
