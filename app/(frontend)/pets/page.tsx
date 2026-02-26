"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/button/Button";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { PawPrint, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import useApi, { ApiResponse } from "@/utils/useApi";
import useAuthGuard from "@/hooks/useAuthGuard";

type Pet = {
    id: number;
    name: string;
    breed: string;
    gender: string;
};

interface PetFromApi {
    id: number;
    name: string;
    gender: string;
    breed: string;
    weight: string;
    color: string;
    dob: string;
    slug: string;
    petTypeId?: number;
}

export default function PetsList() {
    useAuthGuard();
    const router = useRouter();

    const [pets, setPets] = useState<PetFromApi[]>([]);
    const [loadingPets, setLoadingPets] = useState(false);


    const [deletingPetId, setDeletingPetId] = useState<number | null>(null);

    const { fetchApi: fetchPets } = useApi({
        url: "/api/users/pet",
        method: "GET",
        type: "manual",
        requiresAuth: true,
    });

    // Fetch pets from API on component mount
    useEffect(() => {   
        const loadPets = async () => {
            setLoadingPets(true);
            try {
                const res = await fetchPets();
                if (res.code === 200 && res.data) {
                    setPets(Array.isArray(res.data) ? res.data : []);
                }
            } catch (err: any) {
                console.error("Failed to load pets:", err);
            } finally {
                setLoadingPets(false);
            }
        };

        loadPets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                    onClick={() => router.push("/pets/add")}
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
            {loadingPets ? (
                    <p className="text-sm text-gray-500">Loading pets...</p>
                ) : pets.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        No pets added yet
                    </p>
                ) : (
                    pets.map((pet) => (
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
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => router.push(`/pets/edit/${pet.slug}`)}
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
                                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Trash2 size={18} />
                                    )}
                                </button>
                            </div>
                        </div>
                        ))
                    )}
        </motion.div>
    );
}
