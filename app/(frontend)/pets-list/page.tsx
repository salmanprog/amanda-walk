"use client";

import { motion } from "framer-motion";
import { usePetsStore } from "@/store/petsStore";
import Button from "@/components/ui/button/Button";
import { useState } from "react";
import toast from "react-hot-toast";
import { PawPrint } from "lucide-react";
export default function PetsList() {
    const [loading, setLoading] = useState(false);
    const {
        pets,
        selectedPetIds,
        togglePetSelection,
    } = usePetsStore();

    const handleSubmit = async () => {
        if (selectedPetIds.length === 0) {
            toast.error("Please select at least one pet");
            return;
        }

        setLoading(true);
        try {
            await new Promise((res) => setTimeout(res, 1000));
            toast.success("Pets submitted successfully");
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
            className="glass-effect rounded-2xl shadow-2xl p-6 mb-6"
        >
            <div className="text-center mb-10">
                <div className="mx-auto w-16 h-16 bg-[var(--primary-theme)] rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <PawPrint className="text-white" size={32} />
                </div>
                <h1 className="text-3xl font-bold text-center mb-6 gradient-text">
                    Pets List
                </h1>
            </div>

            {pets.length === 0 ? (
                <p className="text-center text-gray-500">
                    No pets added yet
                </p>
            ) : (
                <div className="space-y-4">
                    {pets.map((pet) => {
                        const isSelected = selectedPetIds.includes(pet.id);

                        return (
                            <div
                                key={pet.id}
                                onClick={() => togglePetSelection(pet.id)}
                                className={`cursor-pointer rounded-lg border p-4 flex justify-between items-center transition
                                    ${isSelected
                                        ? "border-[var(--primary-theme)]"
                                        : "border-gray-200"
                                    }`}
                            >
                                <div>
                                    <p className="font-semibold">{pet.petName}</p>
                                    <p className="text-sm text-gray-500">
                                        {pet.petBreed} • {pet.petGender}
                                    </p>
                                </div>

                                {/* Checkbox */}
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => togglePetSelection(pet.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-5 h-5 accent-[var(--primary-theme)]"
                                />
                            </div>
                        );

                    })}
                    <div className="text-right font-medium text-gray-700">
                        Selected Pets: {selectedPetIds.length}
                    </div>
                    <Button
                        variant="secondary"
                        className="w-full"
                        type="button"
                        loading={loading}
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
                </div>
            )}
        </motion.div>
    );
}
