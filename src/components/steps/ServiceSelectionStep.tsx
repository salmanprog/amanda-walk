'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scissors, Heart, Sparkles, ArrowRight, ArrowLeft, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { BookingData } from '@/types/booking';
import toast from 'react-hot-toast'

interface ServiceSelectionStepProps {
  bookingData: BookingData
  updateBookingData: (data: Partial<BookingData>) => void
  nextStep: () => void
  prevStep: () => void
}

const serviceCategories = [
  { id: 'grooming', name: 'Grooming Services', icon: Scissors, color: 'from-pink-400 to-pink-600', bg: 'bg-pink-50' },
  { id: 'spa', name: 'Spa Services', icon: Sparkles, color: 'from-purple-400 to-purple-600', bg: 'bg-purple-50' },
  { id: 'wellness', name: 'Wellness Services', icon: Heart, color: 'from-blue-400 to-blue-600', bg: 'bg-blue-50' },
  { id: 'training', name: 'Training Services', icon: Heart, color: 'from-green-400 to-green-600', bg: 'bg-green-50' },
  { id: 'boarding', name: 'Boarding Services', icon: Sparkles, color: 'from-orange-400 to-orange-600', bg: 'bg-orange-50' },
  { id: 'daycare', name: 'Day Care', icon: Scissors, color: 'from-cyan-400 to-cyan-600', bg: 'bg-cyan-50' },
]

const services: Record<string, Array<{ id: string; name: string; price: number; duration: string; description: string }>> = {
  grooming: [
    { id: 'basic-groom', name: 'Basic Grooming', price: 45, duration: '1 hour', description: 'Bath, brush, and nail trim' },
    { id: 'full-groom', name: 'Full Grooming', price: 75, duration: '2 hours', description: 'Complete grooming package' },
    { id: 'haircut', name: 'Haircut & Styling', price: 60, duration: '1.5 hours', description: 'Professional styling' },
  ],
  spa: [
    { id: 'shave-down', name: 'Shave Down', price: 22, duration: '30 min', description: 'Complete shave service' },
    { id: 'spa-package', name: 'Spa Package', price: 95, duration: '2.5 hours', description: 'Luxury spa treatment' },
    { id: 'teeth-cleaning', name: 'Teeth Cleaning', price: 35, duration: '45 min', description: 'Dental care service' },
  ],
  wellness: [
    { id: 'nail-trim', name: 'Nail Trim', price: 15, duration: '15 min', description: 'Quick nail trimming' },
    { id: 'ear-cleaning', name: 'Ear Cleaning', price: 20, duration: '20 min', description: 'Gentle ear care' },
    { id: 'flea-treatment', name: 'Flea Treatment', price: 30, duration: '30 min', description: 'Flea prevention' },
  ],
  training: [
    { id: 'basic-obedience', name: 'Basic Obedience', price: 80, duration: '1 hour', description: 'Essential commands training' },
    { id: 'advanced-training', name: 'Advanced Training', price: 120, duration: '1.5 hours', description: 'Advanced behavior training' },
    { id: 'puppy-class', name: 'Puppy Class', price: 65, duration: '1 hour', description: 'Socialization for puppies' },
  ],
  boarding: [
    { id: 'standard-boarding', name: 'Standard Boarding', price: 45, duration: 'Per night', description: 'Comfortable overnight stay' },
    { id: 'luxury-suite', name: 'Luxury Suite', price: 85, duration: 'Per night', description: 'Premium boarding experience' },
    { id: 'extended-stay', name: 'Extended Stay', price: 200, duration: 'Per week', description: 'Week-long boarding package' },
  ],
  daycare: [
    { id: 'half-day', name: 'Half Day Care', price: 25, duration: '4 hours', description: 'Morning or afternoon care' },
    { id: 'full-day', name: 'Full Day Care', price: 40, duration: '8 hours', description: 'All-day supervised play' },
    { id: 'weekly-pass', name: 'Weekly Pass', price: 150, duration: '5 days', description: 'Unlimited daycare access' },
  ],
}

export default function ServiceSelectionStep({
  bookingData,
  updateBookingData,
  nextStep,
  prevStep,
}: ServiceSelectionStepProps) {
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 3
    if (window.innerWidth < 640) return 1      // mobile
    if (window.innerWidth < 1024) return 2     // tablet
    return 3                                   // desktop
  }
  const [selectedCategory, setSelectedCategory] = useState(bookingData.serviceCategory || '')
  const [selectedService, setSelectedService] = useState(bookingData.service || '')
  const [showDescription, setShowDescription] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView())
  const maxIndex = Math.max(0, serviceCategories.length - itemsPerView)

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
  }

  const handleSubmit = () => {
    if (!selectedCategory) {
      toast.error('Please select a service category')
      return
    }
    if (!selectedService) {
      toast.error('Please select a service')
      return
    }

    const service = services[selectedCategory].find((s) => s.id === selectedService)
    updateBookingData({
      serviceCategory: selectedCategory,
      service: selectedService,
      price: service?.price,
    })
    toast.success('Service selected! 🎯')
    nextStep()
  }

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView())
      setCurrentIndex(0) // reset position on resize
    }
  
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Select Your Service</h2>
        <p className="text-gray-600">Choose the perfect service for your pet</p>
      </div>

      {/* Service Categories Carousel */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-4">
          Service Category
        </label>
        
        <div className="relative">
          {/* Previous Button */}
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-300 ${
              currentIndex === 0
                ? 'opacity-0 pointer-events-none'
                : 'opacity-100 hover:bg-primary-50 hover:shadow-xl'
            }`}
          >
            <ChevronLeft className="text-primary-600" size={24} />
          </button>

          {/* Carousel Container */}
          <div className="overflow-hidden md:px-[20px]">
            <motion.div
              ref={carouselRef}
              className="flex md:gap-4 md:p-[20px]"
              animate={{
                x: `-${currentIndex * (100 / itemsPerView)}%`,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {serviceCategories.map((category) => {
                const Icon = category.icon
                const isSelected = selectedCategory === category.id

                return (
                  <motion.button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setSelectedService('')
                    }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ minWidth: `calc(${100 / itemsPerView}% - ${(16 * (itemsPerView - 1)) / itemsPerView}px)` }}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      isSelected
                        ? 'border-[var(--primary-theme)] bg-primary-50 shadow-xl ring-1 ring-primary-100'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                    }`}
                  >
                    <div className={`w-16 h-16 mx-auto mb-3 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center shadow-lg`}>
                      <Icon size={32} className="text-white" />
                    </div>
                    <h3 className="font-semibold !text-[var(--primary-theme)] text-center">{category.name}</h3>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-2 flex justify-center"
                      >
                        <div className="w-6 h-6 bg-[var(--primary-theme)] rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="white">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </motion.div>
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-300 ${
              currentIndex >= maxIndex
                ? 'opacity-0 pointer-events-none'
                : 'opacity-100 hover:bg-primary-50 hover:shadow-xl'
            }`}
          >
            <ChevronRight className="text-primary-600" size={24} />
          </button>
        </div>

        {/* Carousel Indicators */}
        {serviceCategories.length > itemsPerView && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-[var(--primary-theme)]'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Services List */}
      <AnimatePresence mode="wait">
        {selectedCategory && (
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Service
            </label>
            <div className="grid gap-3">
              {services[selectedCategory]?.map((service) => {
                const isSelected = selectedService === service.id

                return (
                  <motion.button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedService(service.id)}
                    onMouseEnter={() => setShowDescription(service.id)}
                    onMouseLeave={() => setShowDescription(null)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left relative ${
                      isSelected
                        ? 'border-[var(--primary-theme)] bg-accent-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-800">{service.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{service.duration}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-accent-600">${service.price}</div>
                        <Info size={16} className="text-gray-400 ml-auto mt-1" />
                      </div>
                    </div>
                    <AnimatePresence>
                      {showDescription === service.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                            {service.description}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-4 pt-6">
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