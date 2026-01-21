"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/button/Button";
import { useState } from "react";
import toast from "react-hot-toast";
import { PawPrint, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Pet = {
    id: number;
    name: string;
    breed: string;
    gender: string;
};

export default function PetsList() {
    const router = useRouter();

    //   pets data
    const [pets, setPets] = useState<Pet[]>([
        { id: 1, name: "Buddy", breed: "Golden Retriever", gender: "Male" },
        { id: 2, name: "Luna", breed: "Persian Cat", gender: "Female" },
        { id: 3, name: "Rocky", breed: "German Shepherd", gender: "Male" },
    ]);

    const [deletingPetId, setDeletingPetId] = useState<number | null>(null);

    const handleEditPet = (pet: Pet) => {
        toast.success(`Edit ${pet.name}`);
        // router.push(`/edit-pet/${pet.id}`); // future use
    };

    const handleDeletePet = async (pet: Pet) => {
        setDeletingPetId(pet.id);
        await new Promise((res) => setTimeout(res, 800));
        setPets((prev) => prev.filter((p) => p.id !== pet.id));
        setDeletingPetId(null);
        toast.success(`${pet.name} deleted`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-2xl shadow-2xl p-6 mb-6 relative"
        >
            {/* Add Pet Button */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6">
                <Button
                    onClick={() => router.push("/add-pets")}
                    variant="secondary"
                    className="px-4 py-2"
                    type="button"
                >
                    Add Pet
                </Button>
            </div>

            {/* Header */}
            <div className="flex flex-col items-center mb-10">
                <div className="w-16 h-16 bg-[var(--primary-theme)] rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <PawPrint className="text-white" size={32} />
                </div>
                <h1 className="text-3xl font-bold gradient-text text-center">
                    Pets List
                </h1>
            </div>

            {/* Pets List */}
            {pets.length === 0 ? (
                <p className="text-center text-gray-500">No pets added yet</p>
            ) : (
                <div className="max-w-2xl mx-auto space-y-4">
                    {pets.map((pet) => (
                        <div
                            key={pet.id}
                            className="rounded-lg border p-4 flex justify-between items-center"
                        >
                            <div>
                                <p className="font-semibold">{pet.name}</p>
                                <p className="text-sm text-gray-500">
                                    {pet.breed} • {pet.gender}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleEditPet(pet)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit pet"
                                >
                                    <Edit size={18} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDeletePet(pet)}
                                    disabled={deletingPetId === pet.id}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Delete pet"
                                >
                                    {deletingPetId === pet.id ? (
                                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Trash2 size={18} />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
