'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  isRegistered?: boolean
}

export default function ProgressBar({ currentStep, totalSteps, isRegistered = false }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100

  const getStepLabel = (stepNumber: number) => {
    if (stepNumber === 1) return 'Email'
    if (stepNumber === 2) {
      return isRegistered ? 'Login' : 'Register'
    }
    if (isRegistered) {
      if (stepNumber === 3) return 'Service'
      if (stepNumber === 4) return 'Employee'
      if (stepNumber === 5) return 'Date & Time'
    } else {
      if (stepNumber === 3) return 'Service'
      if (stepNumber === 4) return 'Employee'
      if (stepNumber === 5) return 'Date & Time'
      if (stepNumber === 6) return 'Review'
    }
    return ''
  }

  return (
    <div className="mb-8">
      <div className="relative">
        {/* Progress Line */}
        <div className="h-2 bg-white/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[var(--primary-theme)] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>

        {/* Step Circles */}
        <div className="flex justify-between mt-4">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep

            return (
              <motion.div
                key={index}
                className="flex flex-col items-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg'
                      : isCurrent
                      ? 'bg-[var(--primary-theme)] text-white shadow-glow scale-110'
                      : 'bg-[var(--primary-theme-light)] text-white'
                  }`}
                >
                  {isCompleted ? <Check size={20} /> : stepNumber}
                </div>
                <span className="text-xs text-white mt-2 font-medium">
                  {getStepLabel(stepNumber)}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}