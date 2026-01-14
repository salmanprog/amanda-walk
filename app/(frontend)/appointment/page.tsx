"use client";

import { useState } from "react";
import Button from "@/components/ui/button/Button";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar as CalendarIcon, Clock, Trash, ArrowLeft, ArrowRight, Check } from "lucide-react";
import Link from "next/link";

const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
];

interface Appointment {
    id: string;
    date: Date;
    time: string;
}

export default function AppointmentPage() {
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);

    const handleTimeSelect = (time: string) => {
        if (!selectedDate) {
            toast.error("Please select a date first");
            return;
        }

        // Check if user already selected an appointment for this day
        const hasAppointmentOnDate = appointments.some(
            (appt) => appt.date.toDateString() === selectedDate.toDateString()
        );

        if (hasAppointmentOnDate) {
            toast.error("You can only select one appointment per day");
            return;
        }

        const newAppointment: Appointment = {
            id: crypto.randomUUID(),
            date: selectedDate,
            time,
        };

        setAppointments([...appointments, newAppointment]);
        toast.success("Appointment slot added");
    };

    const removeAppointment = (id: string) => {
        setAppointments(appointments.filter((a) => a.id !== id));
        toast.success("Slot removed");
    };

    const handleSubmit = async () => {
        if (appointments.length === 0) {
            toast.error("Please select at least one appointment slot");
            return;
        }

        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setLoading(false);
        toast.success("Appointments scheduled successfully!");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-2xl shadow-2xl p-6 mb-6 max-w-5xl mx-auto min-h-[600px]"
        >
            <div className="text-center mb-10">
                <div className="mx-auto w-16 h-16 bg-[var(--primary-theme)] rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <CalendarIcon className="text-white" size={32} />
                </div>
                <h1 className="text-3xl font-bold mb-2 gradient-text">
                    Choose Date & Time
                </h1>
                <p className="text-gray-500">Select your preferred appointment slots</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Left Column: Calendar */}
                <div className="flex flex-col">
                    <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
                        <CalendarIcon size={16} className="mr-2" /> Select Date
                    </h2>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-center">
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date: Date | null) => setSelectedDate(date)}
                            inline
                            calendarClassName="!border-none !font-sans"
                            dayClassName={(date) =>
                                "rounded-full hover:bg-purple-100 transition-colors"
                            }
                        />
                        {/* Note: Additional global css overrides might be needed for perfect styling matches */}
                    </div>
                </div>

                {/* Right Column: Time Slots */}
                <div className="flex flex-col">
                    <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
                        <Clock size={16} className="mr-2" /> Select Time
                    </h2>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-[380px] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 gap-3">
                            {timeSlots.map((time) => {
                                // Check if this specific slot is selected for the CURRENT viewed date
                                const isSelected = selectedDate && appointments.some(
                                    (a) => a.date.toDateString() === selectedDate.toDateString() && a.time === time
                                );

                                return (
                                    <button
                                        key={time}
                                        onClick={() => handleTimeSelect(time)}
                                        className={`
                                            py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 border
                                            ${isSelected
                                                ? "bg-[var(--primary-theme)] text-white border-[var(--primary-theme)] shadow-md"
                                                : "bg-[#F8FAFC] text-gray-600 border-transparent hover:bg-gray-100"
                                            }
                                        `}>
                                        {time}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Selected Appointments List */}
            {appointments.length > 0 && (
                <div className="mb-10 animate-fadeIn">
                    <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
                        <Check size={16} className="mr-2" /> Selected Slots ({appointments.length})
                    </h2>
                    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                        {appointments.map((appt, index) => (
                            <div
                                key={appt.id}
                                className={`flex justify-between items-center p-4 ${index !== appointments.length - 1 ? 'border-b border-gray-100' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                        <CalendarIcon size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">
                                            {appt.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                        <p className="text-sm text-gray-500 flex items-center">
                                            <Clock size={12} className="mr-1" /> {appt.time}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeAppointment(appt.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remove slot"
                                >
                                    <Trash size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <Button
                onClick={handleSubmit}
                variant="secondary"
                loading={loading}
                className="w-full"
            >
                Submit
            </Button>
        </motion.div>
    );
}