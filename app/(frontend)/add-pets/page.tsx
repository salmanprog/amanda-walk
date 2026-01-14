"use client";

import { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion, AnimatePresence } from 'framer-motion';
import Select from "@/components/form/Select";
import DatePicker from "react-datepicker";
import { usePetsStore } from "@/store/petsStore";
import { PawPrint } from "lucide-react";
import { useRouter } from "next/navigation";


interface FormState {
    petName: string;
    petGender: string,
    petBreed: string,
    PetWeight: string,
    petColor: string,
    petType: string;
}


export default function AddPets() {
    const { pets, addPet, removePet } = usePetsStore();
    const [startDate, setStartDate] = useState<Date | null>(null);
    const router = useRouter();

    const requiredFields = [
        { key: "petName", label: "Pet Name" },
        { key: "petGender", label: "Pet Gender" },
        { key: "petBreed", label: "Pet Breed" },
        { key: "PetWeight", label: "Pet Weight" },
        { key: "petColor", label: "Pet Color" },
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
        { value: "3", label: "Grey" },
        { value: "4", label: "Other" },
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

    const handleAddPet = () => {
        if (!validateForm()) return;

        const newPet = {
            id: crypto.randomUUID(),
            ...form,
            birthday: startDate,
        };

        addPet(newPet);

        // reset form (optional but recommended)
        setForm({
            petName: "",
            petGender: "",
            petBreed: "",
            PetWeight: "",
            petColor: "",
            petType: "",
        });
        setStartDate(null);

        toast.success("Pet added to list");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (pets.length === 0) {
            toast.error("Please add at least one pet");
            return;
        }

        setLoading(true);

        try {
            await new Promise((res) => setTimeout(res, 1000));
            toast.success("Pet successfully added");
            router.push("/service");
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
                    <PawPrint className="text-white" size={32} />
                </div>
                <h1 className="text-3xl font-bold text-center mb-6 gradient-text">
                    Add Pets
                </h1>
            </div>

            {error && (
                <div className="mb-4 text-red-600 text-sm">
                    {error}
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
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Birthday <span className="text-red-500">*</span>
                        </label>
                        <DatePicker

                            selected={startDate}
                            onChange={(date: Date | null) => setStartDate(date)}

                            placeholderText="Select date"
                            className="w-full h-11 rounded-lg border px-4"
                            dateFormat="dd-MM-yyyy"
                        />
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
                    </div>
                    <div className="">
                        <label className="block text-sm font-medium mb-1">
                            Select Pet Type
                        </label>
                        <Select
                            options={petColorOptions}
                            placeholder="Select Pet Type"
                            value={form.petType}
                            onChange={(value) => handleSelectChange("petType", value)}
                        />
                    </div>
                    <div className="">
                        <label className="block text-sm font-medium mb-1">
                            Add To Your List Of Pets
                        </label>
                        <Button
                            variant="secondary"
                            className="w-full !p-[12px] !rounded-[8px]"
                            type="button"
                            onClick={handleAddPet}
                        >
                            Add
                        </Button>
                    </div>
                </div>
                <div className="border-b ">
                    <h2 className="mb-2">Your Pets</h2>
                </div>
                <div className="pets-lists space-y-3">
                    {pets.length === 0 && (
                        <p className="text-sm text-gray-500">
                            No pets added yet
                        </p>
                    )}

                    {pets.map((pet) => (
                        <div
                            key={pet.id}
                            className="rounded-lg border p-4 flex justify-between items-center"
                        >
                            <div>
                                <p className="font-semibold">{pet.petName}</p>
                                <p className="text-sm text-gray-500">
                                    {pet.petBreed} • {pet.petGender}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => removePet(pet.id)}
                                className="text-red-500 text-sm"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                <Button variant="secondary" className="w-full" type="submit" loading={loading}>
                    Submit
                </Button>
            </form>
        </motion.div>

    );
}
