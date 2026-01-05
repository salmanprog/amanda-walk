'use client'
import { useState, useEffect } from 'react'
import { BookingData } from '@/types/booking'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import EmailCheckStep from '@/components/steps/EmailCheckStep'
import LoginStep from '@/components/steps/LoginStep'
import RegistrationStep from '@/components/steps/RegistrationStep'
import ServiceSelectionStep from '@/components/steps/ServiceSelectionStep'
import DateTimeStep from '@/components/steps/DateTimeStep'
import EmployeeStep from '@/components/steps/EmployeeStep'
import InvoiceStep from '@/components/steps/InvoiceStep'
import ProgressBar from '@/components/ProgressBar';
import { Phone, MapPin } from 'lucide-react'

export default function BookingForm() {
  useEffect(() => {
    const savedStep = localStorage.getItem('booking_step')
    const savedData = localStorage.getItem('booking_data')

    if (savedStep) {
      setCurrentStep(Number(savedStep))
    }

    if (savedData) {
      setBookingData(JSON.parse(savedData))
    }
  }, [])

  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState<BookingData>({
    email: '',
    isRegistered: false,
  })

  const clearBookingStorage = () => {
    localStorage.removeItem('booking_step')
    localStorage.removeItem('booking_data')
  }


  const totalSteps = 6

  useEffect(() => {
    localStorage.setItem('booking_step', currentStep.toString())
  }, [currentStep])

  useEffect(() => {
    localStorage.setItem('booking_data', JSON.stringify(bookingData))
  }, [bookingData])

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const renderStep = () => {
    // Step 1: Email Check
    if (currentStep === 1) {
      return (
        <EmailCheckStep
          bookingData={bookingData}
          updateBookingData={updateBookingData}
          nextStep={nextStep}
        />
      )
    }

    // Step 2: Login (if registered) or Registration (if new user)
    if (currentStep === 2) {
      if (bookingData.isRegistered) {
        return (
          <LoginStep
            bookingData={bookingData}
            updateBookingData={updateBookingData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )
      } else {
        return (
          <RegistrationStep
            bookingData={bookingData}
            updateBookingData={updateBookingData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )
      }
    }

    // Step 3+: Service Selection, Date/Time, Employee, Invoice
    // Both registered and new users follow the same steps after step 2
    if (currentStep === 3) {
      return (
        <ServiceSelectionStep
          bookingData={bookingData}
          updateBookingData={updateBookingData}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )
    }

    if (currentStep === 4) {
      return (
        <EmployeeStep
          bookingData={bookingData}
          updateBookingData={updateBookingData}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )
    }

    if (currentStep === 5) {
      return (
        <DateTimeStep
          bookingData={bookingData}
          updateBookingData={updateBookingData}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )
    }

    

    if (currentStep === 6) {
      return (
        <InvoiceStep
          bookingData={bookingData}
          prevStep={prevStep}
        />
      )
    }

    return null
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl shadow-2xl p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">
                Amanda Everything Pets
              </h1>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 text-gray-600 text-sm">
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  <span>(773) 307-7938</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>301 Blackstone Ave Willow Springs, IL 60480</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} isRegistered={bookingData.isRegistered} />

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-effect rounded-2xl shadow-2xl p-8 min-h-[500px]"
        >
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-white text-sm"
        >
          © 2024 amandaeverythingpets All rights reserved
        </motion.div>
      </div>
    </div>
  )
}