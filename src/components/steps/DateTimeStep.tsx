'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, Clock, ArrowRight, ArrowLeft } from 'lucide-react'
import { BookingData } from '@/types/booking';
import toast from 'react-hot-toast'

interface DateTimeStepProps {
  bookingData: BookingData
  updateBookingData: (data: Partial<BookingData>) => void
  nextStep: () => void
  prevStep: () => void
}

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
]

export default function DateTimeStep({
  bookingData,
  updateBookingData,
  nextStep,
  prevStep,
}: DateTimeStepProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    bookingData.selectedDate
      ? new Date(bookingData.selectedDate)
      : null
  )
  const [selectedTime, setSelectedTime] = useState(bookingData.selectedTime || '')

  // Simple calendar generation
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const handleSubmit = () => {
    if (!selectedDate) {
      toast.error('Please select a date')
      return
    }
    if (!selectedTime) {
      toast.error('Please select a time')
      return
    }

    updateBookingData({
      selectedDate,
      selectedTime,
    })
    toast.success('Date & time selected! 📅')
    nextStep()
  }

  const isDatePast = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    return date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
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
          <CalendarIcon size={40} className="text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Choose Date & Time</h2>
        <p className="text-gray-600">Select your preferred appointment slot</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Date
          </label>
          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
            <div className="text-center mb-4">
              <h3 className="font-bold text-lg text-gray-800">
                {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-600">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {emptyDays.map((_, index) => (
                <div key={`empty-${index}`} />
              ))}
              {days.map((day) => {
                const date = new Date(currentYear, currentMonth, day)
                const isSelected = selectedDate?.getDate() === day
                const isPast = isDatePast(day)

                return (
                  <motion.button
                    key={day}
                    type="button"
                    disabled={isPast}
                    onClick={() => setSelectedDate(date)}
                    whileHover={!isPast ? { scale: 1.1 } : {}}
                    whileTap={!isPast ? { scale: 0.9 } : {}}
                    className={`aspect-square rounded-lg text-sm font-medium transition-all duration-300 ${
                      isPast
                        ? 'text-gray-300 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[var(--primary-theme)] text-white shadow-lg'
                        : 'bg-[var(--primary-theme-light)] text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {day}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Time Slots */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <Clock className="inline mr-2" size={16} />
            Select Time
          </label>
          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 max-h-[400px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((time) => {
                const isSelected = selectedTime === time

                return (
                  <motion.button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isSelected
                        ? 'bg-[var(--primary-theme)] text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {time}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {selectedDate && selectedTime && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 rounded-xl border border-green-200"
        >
          <p className="text-sm text-green-800 text-center">
            <strong>📅 Selected:</strong> {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {selectedTime}
          </p>
        </motion.div>
      )}

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