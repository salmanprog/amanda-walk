"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion, AnimatePresence } from 'framer-motion';
import Select from "@/components/form/Select";
import DatePicker from "react-datepicker";
import { PawPrint, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import useApi, { ApiResponse } from "@/utils/useApi";
import useAuthGuard from "@/hooks/useAuthGuard";

interface FormState {
    petName: string;
    petGender: string,
    petBreed: string,
    PetWeight: string,
    petColor: string,
    petType: string;
}

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

export default function AddPets() {
    useAuthGuard();
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [pets, setPets] = useState<PetFromApi[]>([]);
    const [loadingPets, setLoadingPets] = useState(false);
    const [editingPet, setEditingPet] = useState<PetFromApi | null>(null);
    const [deletingPetId, setDeletingPetId] = useState<number | null>(null);
    const router = useRouter();

    const { sendData, loading: apiLoading } = useApi({
        url: "/api/users/pet",
        type: "manual",
        requiresAuth: true,
    });

    const { fetchApi: fetchPets } = useApi({
        url: "/api/users/pet",
        method: "GET",
        type: "manual",
        requiresAuth: true,
    });

    // Helper function to make API calls with dynamic URLs
    const makeApiCall = async (url: string, method: "POST" | "PATCH" | "DELETE", data?: any): Promise<ApiResponse> => {
        const token = typeof window !== "undefined" 
            ? localStorage.getItem("token") || sessionStorage.getItem("token") || ""
            : "";

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const options: RequestInit = {
            method,
            headers,
        };

        if (data && method !== "DELETE") {
            options.body = JSON.stringify(data);
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
        const response = await fetch(`${baseUrl}${url}`, options);
        return await response.json() as ApiResponse;
    };

    const requiredFields = [
        { key: "petName", label: "Pet Name" },
        { key: "petGender", label: "Pet Gender" },
        { key: "petBreed", label: "Pet Breed" },
        { key: "PetWeight", label: "Pet Weight" },
        { key: "petColor", label: "Pet Color" },
        { key: "petType", label: "Pet Type" },
    ];
    const [form, setForm] = useState<FormState>({
        petName: "",
        petGender: "",
        petBreed: "",
        PetWeight: "",
        petColor: "",
        petType: "",
    });

    const petGenderOptions = [
        { value: "Male", label: "Male-Not Neutered" },
        { value: "Female", label: "Female-Not Spayed" },
        { value: "MaleNeutered", label: "Male Neutered" },
        { value: "FemaleSpayed", label: "Female Spayed" },
    ];
    const petColorOptions = [
        { value: "1", label: "black" },
        { value: "2", label: "Brown" },
        { value: "3", label: "Grey" },
        { value: "4", label: "Other" },
    ];
    const petTypeOptions = [
        { value: "1", label: "Dog" },
        { value: "2", label: "Cat" },
    ];

    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        // Clear error for this field when user types
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setForm({
            ...form,
            [name]: value,
        });
        // Clear error for this field when user selects
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    // Helper function to map gender from form to API format
    const mapGenderToApi = (gender: string): string => {
        const genderMap: Record<string, string> = {
            "Male": "MALE",
            "Female": "FEMALE",
            "MaleNeutered": "MALE",
            "FemaleSpayed": "FEMALE",
        };
        return genderMap[gender] || "MALE";
    };

    // Helper function to map gender from API to form format
    const mapGenderFromApi = (gender: string): string => {
        if (gender === "MALE") return "Male";
        if (gender === "FEMALE") return "Female";
        return "Male";
    };

    // Helper function to format date as string (YYYY-MM-DD)
    const formatDateToString = (date: Date | null): string => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Helper function to parse date string to Date
    const parseDateFromString = (dateString: string): Date | null => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    };

    const validateForm = () => {
        for (const field of requiredFields) {
            if (!form[field.key as keyof typeof form]) {
                toast.error(`${field.label} is required`);
                return false;
            }
        }

        if (!startDate) {
            toast.error("Pet birthday is required");
            return false;
        }

        return true;
    };

    const handleAddPet = async () => {
        if (!validateForm()) return;

        setError(null);
        setErrors({});

        try {
            // Prepare pet data for API
            const petData = {
                name: form.petName,
                petTypeId: form.petType || "1",
                gender: mapGenderToApi(form.petGender),
                dob: formatDateToString(startDate),
                breed: form.petBreed,
                weight: form.PetWeight,
                color: form.petColor || "",
                notes: "",
            };

            let res: ApiResponse;

            if (editingPet) {
                // Update existing pet
                res = await makeApiCall(`/api/users/pet/${editingPet.slug}`, "PATCH", petData);
            } else {
                // Create new pet
                res = await sendData<ApiResponse>(petData, undefined, "POST");
            }

            if (res.code === 200) {
                // Reset form
                setForm({
                    petName: "",
                    petGender: "",
                    petBreed: "",
                    PetWeight: "",
                    petColor: "",
                    petType: "",
                });
                setStartDate(null);
                setEditingPet(null);
                setErrors({});

                toast.success(editingPet ? "Pet updated successfully" : "Pet added successfully");

                // Fetch updated pets list from API
                const petsRes = await fetchPets();
                if (petsRes.code === 200 && petsRes.data) {
                    setPets(Array.isArray(petsRes.data) ? petsRes.data : []);
                }
            } else if (res.code === 400) {
                // Handle validation errors
                setErrors(res.data ?? {});
                toast.error(res.message || "Validation failed");
            } else {
                throw new Error(res.message || editingPet ? "Failed to update pet" : "Failed to add pet");
            }
        } catch (err: any) {
            const errorMessage = err?.message || (editingPet ? "Failed to update pet. Please try again." : "Failed to add pet. Please try again.");
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };


    const handleCancelEdit = () => {
        setEditingPet(null);
        setForm({
            petName: "",
            petGender: "",
            petBreed: "",
            PetWeight: "",
            petColor: "",
            petType: "",
        });
        setStartDate(null);
        setErrors({});
        setError(null);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (pets.length === 0) {
            toast.error("Please add at least one pet before continuing");
            return;
        }

        // All pets are already added via API, just redirect
        toast.success("Proceeding to service selection");
        router.push("/service");
    };



    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-2xl shadow-2xl p-6 mb-6">
            <div className="text-center mb-10">
                <div className="mx-auto w-16 h-16 bg-[var(--primary-theme)] rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <PawPrint className="text-white" size={32} />
                </div>
                <h1 className="text-3xl font-bold text-center mb-6 gradient-text">
                {editingPet ? "Edit" : "Add"} Pets
                </h1>
            </div>

            {error && (
                <div className="mb-4 text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* Display validation errors for fields not in form (like notes) */}
            {Object.keys(errors).length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    {Object.entries(errors).map(([key, value]) => {
                        // Only show errors for fields that don't have their own error display
                        const hasFieldDisplay = ['name', 'gender', 'dob', 'breed', 'weight', 'color', 'petTypeId'].includes(key);
                        if (hasFieldDisplay) return null;
                        return (
                            <p key={key} className="text-red-600 text-sm">
                                {key}: {value}
                            </p>
                        );
                    })}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Pet Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            name="petName"
                            placeholder="Pet Name"
                            required
                            value={form.petName}
                            onChange={handleChange}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                        )}
                    </div>
                    <div className="">
                        <label className="block text-sm font-medium mb-1">
                            Select Pet Gender <span className="text-red-500">*</span>
                        </label>
                        <Select
                            options={petGenderOptions}
                            placeholder="Select Pet Gender"
                            value={form.petGender}
                            onChange={(value) => handleSelectChange("petGender", value)}
                        />
                        {errors.gender && (
                            <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Birthday <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date: Date | null) => {
                                setStartDate(date);
                                if (errors.dob) {
                                    setErrors({ ...errors, dob: "" });
                                }
                            }}
                            placeholderText="Select date"
                            className="w-full h-11 rounded-lg border px-4"
                            dateFormat="dd-MM-yyyy"
                        />
                        {errors.dob && (
                            <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Pet Breed <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            name="petBreed"
                            required
                            placeholder="Breed"
                            value={form.petBreed}
                            onChange={handleChange}
                        />
                        {errors.breed && (
                            <p className="text-red-500 text-xs mt-1">{errors.breed}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Pet Weight <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="number"
                            name="PetWeight"
                            required
                            placeholder="Pet Weight"
                            value={form.PetWeight}
                            onChange={handleChange}
                        />
                        {errors.weight && (
                            <p className="text-red-500 text-xs mt-1">{errors.weight}</p>
                        )}
                    </div>
                    <div className="">
                        <label className="block text-sm font-medium mb-1">
                            Select Pet Color
                        </label>
                        <Select
                            options={petColorOptions}
                            placeholder="Select Pet Color"
                            value={form.petColor}
                            onChange={(value) => handleSelectChange("petColor", value)}
                        />
                        {errors.color && (
                            <p className="text-red-500 text-xs mt-1">{errors.color}</p>
                        )}
                    </div>
                    <div className="">
                        <label className="block text-sm font-medium mb-1">
                            Select Pet Type
                        </label>
                        <Select
                            options={petTypeOptions}
                            placeholder="Select Pet Type"
                            value={form.petType}
                            onChange={(value) => handleSelectChange("petType", value)}
                        />
                        {errors.petTypeId && (
                            <p className="text-red-500 text-xs mt-1">{errors.petTypeId}</p>
                        )}
                    </div>
                    <div className="">
                        <label className="block text-sm font-medium mb-1">
                            {editingPet ? "Update Pet" : "Add To Your List Of Pets"}
                        </label>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                className="flex-1 !p-[12px] !rounded-[8px]"
                                type="button"
                                onClick={handleAddPet}
                                loading={apiLoading}
                            >
                                {editingPet ? "Update" : "Add"}
                            </Button>
                            {editingPet && (
                                <Button
                                    variant="secondary"
                                    className="!p-[12px] !rounded-[8px]"
                                    type="button"
                                    onClick={handleCancelEdit}
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </motion.div>

    );
}
