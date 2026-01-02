'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, MapPin, ArrowRight, ArrowLeft } from 'lucide-react'
import { BookingData } from '@/types/booking';
import toast from 'react-hot-toast'

interface RegistrationStepProps {
  bookingData: BookingData
  updateBookingData: (data: Partial<BookingData>) => void
  nextStep: () => void
  prevStep: () => void
}

export default function RegistrationStep({
  bookingData,
  updateBookingData,
  nextStep,
  prevStep,
}: RegistrationStepProps) {
  const [formData, setFormData] = useState({
    fullName: bookingData.fullName || '',
    phone: bookingData.phone || '',
    address: bookingData.address || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.fullName || !formData.phone || !formData.address) {
      toast.error('Please fill in all fields')
      return
    }
    
    updateBookingData({ ...formData })
    toast.success('Registration successful! 🎉')
    nextStep()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 mx-auto mb-4 bg-[var(--primary-theme)] rounded-full flex items-center justify-center shadow-lg"
        >
          <User size={40} className="text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Your Account</h2>
        <p className="text-gray-600">Tell us a bit about yourself</p>
        <p className="text-sm text-primary-600 font-medium mt-2">{bookingData.email}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-100 outline-none transition-all duration-300 text-gray-800"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-100 outline-none transition-all duration-300 text-gray-800"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
            Address
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St, City, State"
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-100 outline-none transition-all duration-300 text-gray-800"
              required
            />
          </div>
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
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-[var(--primary-theme)] text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            Create Account
            <ArrowRight size={20} />
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}