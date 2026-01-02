export interface BookingData {
    email: string
    isRegistered: boolean
    fullName?: string
    phone?: string
    address?: string
    serviceCategory?: string
    service?: string
    selectedDate?: Date
    selectedTime?: string
    selectedEmployee?: string
    price?: number
  }