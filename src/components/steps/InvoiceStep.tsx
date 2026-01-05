'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Calendar, Clock, User, Mail, DollarSign, ArrowLeft } from 'lucide-react'
import { BookingData } from '@/types/booking';
import toast from 'react-hot-toast'

interface InvoiceStepProps {
  bookingData: BookingData
  prevStep: () => void
}

export default function InvoiceStep({ bookingData, prevStep }: InvoiceStepProps) {
  const selectedDate =
    bookingData.selectedDate instanceof Date
      ? bookingData.selectedDate
      : bookingData.selectedDate
        ? new Date(bookingData.selectedDate)
        : null;
  const serviceFee = 0.77
  const tax = 0.77
  const discount = 0
  const total = (bookingData.price || 0) + serviceFee + tax - discount

  const handleConfirm = () => {
    toast.success('🎉 Booking confirmed!')
    // Here you would typically send the booking data to your backend
    console.log('Booking Data:', bookingData)
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
          className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg"
        >
          <CheckCircle size={40} className="text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Review Your Booking</h2>
        <p className="text-gray-600">Please review the details before confirming</p>
      </div>

      <div className="bg-gradient-to-br from-primary-50 to-purple-50 p-6 rounded-xl border border-primary-200">
        <h3 className="text-lg font-bold !text-gray-800 mb-4 flex items-center gap-2">
          <User size={20} className="text-" />
          Customer Information
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-semibold text-gray-800">{bookingData.fullName || 'Registered User'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-semibold text-gray-800">{bookingData.email}</span>
          </div>
          {bookingData.phone && (
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-semibold text-gray-800">{bookingData.phone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold !text-gray-800 mb-4">Appointment Details</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Calendar className="text-primary-600 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-600">Date & Time</p>
              <p className="font-semibold text-gray-800">
                {selectedDate?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                at {bookingData.selectedTime}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <User className="text-primary-600 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-600">Groomer</p>
              <p className="font-semibold text-gray-800 capitalize">
                {bookingData.selectedEmployee?.replace('-', ' ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold !text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign size={20} className="text-green-600" />
          Invoice
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-gray-700">
            <span>Service ({bookingData.service})</span>
            <span className="font-semibold">${bookingData.price?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Service Fee</span>
            <span>${serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total taxes and fees</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Applied Discount</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t-2 border-gray-200 pt-3 mt-3">
            <div className="flex justify-between text-lg font-bold text-gray-800">
              <span>Grand Total</span>
              <span className="text-2xl text-primary-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-green-50 rounded-xl border border-green-200"
      >
        <p className="text-sm text-green-800 text-center">
          ✅ <strong>Reservation confirmed!</strong>
        </p>
      </motion.div>

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
          onClick={handleConfirm}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
        >
          Confirm
        </motion.button>
      </div>
    </motion.div>
  )
}