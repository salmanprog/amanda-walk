'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Star, ArrowRight, ArrowLeft } from 'lucide-react'
import { BookingData } from '@/types/booking';
import toast from 'react-hot-toast'

interface EmployeeStepProps {
  bookingData: BookingData
  updateBookingData: (data: Partial<BookingData>) => void
  nextStep: () => void
  prevStep: () => void
}

const employees = [
  {
    id: 'amanda',
    name: 'Amanda Grooming',
    title: 'Master Groomer',
    rating: 5.0,
    reviews: 124,
    specialty: 'All breeds, specialty cuts',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  },
  {
    id: 'sarah',
    name: 'Sarah Johnson',
    title: 'Senior Stylist',
    rating: 4.9,
    reviews: 98,
    specialty: 'Long-haired breeds',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
  },
  {
    id: 'mike',
    name: 'Mike Peterson',
    title: 'Grooming Specialist',
    rating: 4.8,
    reviews: 87,
    specialty: 'Large breeds, spa treatments',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
  },
]

export default function EmployeeStep({
  bookingData,
  updateBookingData,
  nextStep,
  prevStep,
}: EmployeeStepProps) {
  const [selectedEmployee, setSelectedEmployee] = useState(bookingData.selectedEmployee || '')

  const handleSubmit = () => {
    if (!selectedEmployee) {
      toast.error('Please select a groomer')
      return
    }

    updateBookingData({ selectedEmployee })
    toast.success('Groomer selected! 👨‍💼')
    nextStep()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 mx-auto mb-4 bg-[var(--primary-theme)] rounded-full flex items-center justify-center shadow-lg"
        >
          <Users size={40} className="text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Groomer</h2>
        <p className="text-gray-600">Select the perfect professional for your pet</p>
      </div>

      <div className="space-y-4">
        {employees.map((employee) => {
          const isSelected = selectedEmployee === employee.id

          return (
            <motion.button
              key={employee.id}
              type="button"
              onClick={() => setSelectedEmployee(employee.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                isSelected
                  ? 'border-[var(--primary-theme)] bg-primary-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <img
                  src={employee.image}
                  alt={employee.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold !text-[var(--primary-theme)]">{employee.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">Services</p>
                  <p className="text-sm text-primary-600 font-medium">
                    {employee.specialty}
                  </p>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      <div className="flex gap-4 pt-4">
        <motion.button
          type="button"
          onClick={prevStep}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-[var(--primary-theme-light)]  text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <ArrowLeft size={20} />
          Back
        </motion.button>
        <motion.button
          type="button"
          onClick={handleSubmit}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-[var(--primary-theme)] text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
        >
          Continue
          <ArrowRight size={20} />
        </motion.button>
      </div>
    </motion.div>
  )
}