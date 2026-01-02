'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Loader2 } from 'lucide-react'
import { BookingData } from '@/types/booking';
import toast from 'react-hot-toast'

interface EmailCheckStepProps {
  bookingData: BookingData
  updateBookingData: (data: Partial<BookingData>) => void
  nextStep: () => void
}

export default function EmailCheckStep({
  bookingData,
  updateBookingData,
  nextStep,
}: EmailCheckStepProps) {
  const [email, setEmail] = useState(bookingData.email)
  const [loading, setLoading] = useState(false)

  // Mock function to check if user is registered
  const checkEmail = async () => {
    setLoading(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // Mock: emails ending with @registered.com are considered registered
    const isRegistered = email.endsWith('@registered.com')
    
    setLoading(false)
    
    if (isRegistered) {
      toast.success('Welcome back! 🎉')
      updateBookingData({ email, isRegistered: true })
    } else {
      toast.success('Let\'s create your account! 🚀')
      updateBookingData({ email, isRegistered: false })
    }
    
    nextStep()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    
    checkEmail()
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
          className="w-20 h-20 mx-auto mb-4  bg-[var(--primary-theme)] rounded-full flex items-center justify-center shadow-lg"
        >
          <Mail size={40} className="text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome!</h2>
        <p className="text-gray-600">Enter your email to get started with booking</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your-email@example.com"
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-100 outline-none transition-all duration-300 text-gray-800 placeholder-gray-400"
              required
            />
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn btn-primary w-full flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Checking...
            </>
          ) : (
            <>
              Continue
              <ArrowRight size={20} />
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>✨ First time here?</strong> Don't worry! We'll guide you through a quick registration process.
        </p>
      </div>
    </motion.div>
  )
}