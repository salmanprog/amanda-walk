"use client"; // Add this directive at the top

import { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Sparkles, Check, Info, HandPlatter, CalendarIcon, Clock, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import useApi from "@/utils/useApi";
import useAuthGuard from "@/hooks/useAuthGuard";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ScheduleSlotOption {
  id: number;
  slug: string;
  label: string;
}

interface Appointment {
  id: string;
  date: Date;
  time: string;
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

/** Shape from GET /api/users/services-categories (AdminServiceCategoryResource) */
interface ServiceCategoryFromApi {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
}

export default function ServicePage() {
  useAuthGuard();
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categoryServices, setCategoryServices] = useState<any[]>([]);
  const [selectedPets, setSelectedPets] = useState<number[]>([]);
  const [pets, setPets] = useState<PetFromApi[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [servicesCategories, setServicesCategories] = useState<ServiceCategoryFromApi[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlotOption[]>([]);
  const [loadingScheduleSlots, setLoadingScheduleSlots] = useState(false);
  const router = useRouter();

  // API hooks to fetch data
  const { fetchApi: fetchPets } = useApi({
    url: "/api/users/pet",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  const { fetchApi: fetchServicesCategories } = useApi({
    url: "/api/users/services-categories",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  const { fetchApi: fetchServices } = useApi({
    url: "/api/users/services",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  const { sendData: sendBooking } = useApi({
    url: "/api/users/booking",
    method: "POST",
    type: "manual",
    requiresAuth: true,
  });

  const { fetchApi: fetchScheduleSlots } = useApi({
    url: "/api/users/schedule-slots",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  // Fetch pets
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
  }, []);

  useEffect(() => {
    const loadScheduleSlots = async () => {
      setLoadingScheduleSlots(true);
      try {
        const res = await fetchScheduleSlots();
        if (res.code === 200 && res.data && Array.isArray(res.data)) {
          setScheduleSlots(res.data as ScheduleSlotOption[]);
        }
      } catch (err: unknown) {
        console.error("Failed to load schedule slots:", err);
        toast.error("Failed to load time slots");
      } finally {
        setLoadingScheduleSlots(false);
      }
    };
    void loadScheduleSlots();
  }, []);

  // Fetch services categories from GET /api/users/services-categories
  useEffect(() => {
    const loadServicesCategories = async () => {
      setLoadingServices(true);
      try {
        const res = await fetchServicesCategories();
        if (res.code === 200 && res.data) {
          setServicesCategories(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err: any) {
        console.error("Failed to load service categories:", err);
        toast.error("Failed to load service categories");
      } finally {
        setLoadingServices(false);
      }
    };

    loadServicesCategories();
  }, []);

  // Fetch services for the selected category
  const {
    data: servicesData,
    fetchApi: fetchServicesData,
    loading: servicesLoading,
  } = useApi({
    url: selectedCategory ? `/api/users/services?cat_id=${selectedCategory}` : "",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategory(categoryId);
  };

  useEffect(() => {
    if (selectedCategory === null) return;

    const loadServices = async () => {
      setLoadingServices(true);
      try {
        const res = await fetchServicesData();
        if (res.code === 200 && res.data) {
          setCategoryServices(res.data);
        }
      } catch (err: any) {
        console.error("Failed to fetch services:", err);
        toast.error("Failed to fetch services for the selected category.");
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, [selectedCategory]);

  const togglePet = (petId: number) => {
    setSelectedPets((prev) =>
      prev.includes(petId)
        ? prev.filter((id) => id !== petId)
        : [...prev, petId]
    );
  };

  // Handle time slot selection
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

  // Remove appointment
  const removeAppointment = (id: string) => {
    setAppointments(appointments.filter((a) => a.id !== id));
    toast.success("Slot removed");
  };

  // Handle submit
  const handleSubmit = async () => {
    if (selectedPets.length === 0) {
      toast.error("Please select at least one pet");
      return;
    }

    if (selectedService === null) {
      toast.error("Please select a service");
      return;
    }

    if (selectedCategory === null) {
      toast.error("Please select a service category");
      return;
    }

    const selectedServiceObj = categoryServices.find((s) => s.id === selectedService);
    const totalPrice = selectedServiceObj?.price != null ? String(selectedServiceObj.price) : "0";

    setLoading(true);

    try {
      const schedule = appointments.map((a) => ({
        schedule_date: a.date.toISOString().slice(0, 10),
        schedule_time: a.time,
      }));

      const res = await sendBooking({
        serviceCategoryId: String(selectedCategory),
        serviceId: String(selectedService),
        quantity: "1",
        tax: "0",
        discount: "0",
        totalPrice,
        employeeId: 0,
        petId: selectedPets[0],
        schedule: JSON.stringify(schedule),
      });

      if (res.code === 200) {
        toast.success("Service selected successfully!");
        router.push("/appointment");
      } else {
        toast.error(res.message || "Booking failed");
      }
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
        <h1 className="text-3xl font-bold mb-2 gradient-text">Book Your Appointment</h1>
        <p className="text-gray-500">Choose the perfect service for your pet</p>
      </div>

      {/* PET CHECKBOXES */}
      <div className="mb-10">
        <h2 className="text-sm font-bold text-gray-700 mb-4 text-center">Select Pets</h2>

        {loadingPets ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Loading pets...</p>
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-4">No pets available. Please add a pet first.</p>
            <Button onClick={() => router.push("/pets/add")} variant="secondary" className="px-4 py-2" type="button">
              Add Pet
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            {pets.map((pet) => (
              <label
                key={pet.id}
                className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPets.includes(pet.id) ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedPets.includes(pet.id)}
                  onChange={() => togglePet(pet.id)}
                  className="w-5 h-5 accent-indigo-600"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">{pet.name}</span>
                  <span className="text-xs text-gray-500">{pet.breed} • {pet.gender}</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Service Category - Display only if pets are selected */}
      {selectedPets.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-700 mb-4 text-center">Select Service Category</h2>

          {loadingServices ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">Loading service categories...</p>
            </div>
          ) : (
            <div className="flex justify-center gap-4">
              {servicesCategories.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No service categories available.</p>
                </div>
              ) : (
                servicesCategories.map((category) => (
                  <div key={category.id} className="flex justify-center">
                    <div
                      onClick={() => handleCategoryClick(category.id)}
                      className="w-48 h-40 bg-white border-2 border-indigo-200 rounded-2xl shadow-sm flex flex-col items-center justify-center relative"
                    >
                      <div className="w-16 h-16 rounded-full bg-[#A855F7] flex items-center justify-center mb-3 shadow-inner">
                        <Sparkles className="text-white" size={28} />
                      </div>
                      <span className="font-bold text-[#1E293B]">{category.title}</span>
                      <div className="mt-2 bg-gradient rounded-full p-0.5">
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* SERVICES LIST */}
      {categoryServices.length === 0 ? (
        <p></p>
      ) : (
        <div className="mb-10">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Select Service</h2>
          {categoryServices.map((service) => (
            <div className="space-y-4" key={service.id}>
              <div
                onClick={() => setSelectedService(service.id)}
                className={`relative p-5 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center bg-white
                  ${selectedService === service.id
                    ? "border-indigo-500 shadow-lg scale-[1.01]"
                    : "border-gray-200 hover:border-indigo-300 hover:shadow-md"
                  }`}
              >
                <div>
                  <h3 className="font-bold text-lg text-[#1E293B]">{service.title}</h3>
                  <p className="text-gray-500 text-sm font-medium">{service.description}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-xl font-bold text-[#1E293B]">{service.price}</span>
                  <Info size={18} className="text-gray-300 mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Date and Time Selection */}
      {selectedService && selectedPets.length > 0 && (
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
            </div>
          </div>

          {/* Right Column: Time Slots */}
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
              <Clock size={16} className="mr-2" /> Select Time
            </h2>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-[380px] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                {loadingScheduleSlots ? (
                  <p className="col-span-2 text-center text-sm text-gray-500 py-6">Loading time slots…</p>
                ) : scheduleSlots.length === 0 ? (
                  <p className="col-span-2 text-center text-sm text-gray-500 py-6">
                    No time slots available.
                  </p>
                ) : (
                  scheduleSlots.map((slot) => {
                    const time = slot.label;
                    const isSelected =
                      selectedDate &&
                      appointments.some(
                        (a) =>
                          a.date.toDateString() === selectedDate.toDateString() && a.time === time
                      );

                    return (
                      <button
                        key={slot.slug}
                        type="button"
                        onClick={() => handleTimeSelect(time)}
                        className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 border ${
                          isSelected
                            ? "bg-[var(--primary-theme)] text-white border-[var(--primary-theme)] shadow-md"
                            : "bg-[#F8FAFC] text-gray-600 border-transparent hover:bg-gray-100"
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* NEXT BUTTON */}
      <Button onClick={handleSubmit} variant="secondary" className="w-full" type="submit" loading={loading}>
        Book Now
      </Button>
    </motion.div>
  );
}
