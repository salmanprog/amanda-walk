import * as yup from "yup";

export const storeUser = yup.object({
  name: yup.string().required("Name is required").min(2).max(20),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6).max(100).required("Password is required"),
  mobileNumber: yup.string().required("Mobile number is required"),
  emergencyname: yup.string().required("Emergency name is required"),
  emergencyNumber: yup.string().required("Emergency number is required"),
  referedBy: yup.string().optional(),
  vetName: yup.string().optional(),
  streetAddress: yup.string().optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),
  postalCode: yup.string().optional(),
  country: yup.string().optional(),
});

export const updateUser = yup.object({
  name: yup.string().min(2).max(20).optional(),
  mobileNumber: yup.string().optional().nullable(),
  status: yup.boolean().optional(),
  referedBy: yup.string().optional(),
  vetName: yup.string().optional(),
  streetAddress: yup.string().optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),
  postalCode: yup.string().optional(),
  country: yup.string().optional(),
});

export const storeEmployee = yup.object({
  name: yup.string().required("Name is required").min(2).max(20),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6).max(100).required("Password is required"),
});

export const updateEmployee = yup.object({
  name: yup.string().min(2).max(20).optional(),
  mobileNumber: yup.string().optional().nullable(),
});

export const changePassword = yup.object({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup.string().min(6).max(100).required("New password is required"),
  confirmPassword: yup.string()
    .required("Please confirm your password")
    .oneOf([yup.ref("newPassword")], "Passwords must match"), 
});

export const storeUserAddress = yup.object({
  addressLine1: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  country: yup.string().required("Country is required"),
  postalCode: yup.string().required("postalCode is required"),
});

export const updateUserAddress = yup.object({
  addressLine1: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  country: yup.string().required("Country is required"),
  postalCode: yup.string().required("postalCode is required"),
});

export const storeEventCategory = yup.object({
  name: yup.string().required("Category name is required"),
});

export const updateEventCategory = yup.object({
  name: yup.string().required("Category name is required"),
});

export const storeEvent = yup.object({
  title: yup.string().required("Event name is required"),
  categoryId: yup.string().required("Event category is required"),
  price: yup.string().required("Event price is required"),
});

export const updateEvent = yup.object({
  title: yup.string().required("Event name is required"),
  categoryId: yup.string().required("Event category is required"),
  price: yup.string().required("Event price is required"),
});

export const storeEventCategoryFaq = yup.object({
  eventCategoryId: yup.string().required("Event category is required"),
  question: yup.string().required("Question is required"),
  answer: yup.string().required("Answer is required"),
});

export const updateEventCategoryFaq = yup.object({
  eventCategoryId: yup.string().required("Event category is required"),
  question: yup.string().required("Question is required"),
  answer: yup.string().required("Answer is required"),
});

export const storeBlog = yup.object({
  title: yup.string().required("Blog title is required"),
  description: yup.string().optional(),
  seoTitle: yup.string().optional(),
  seoDescription: yup.string().optional(),
});

export const updateBlog = yup.object({
  title: yup.string().required("Blog title is required"),
  description: yup.string().optional(),
  seoTitle: yup.string().optional(),
  seoDescription: yup.string().optional(),
});

export const storeServiceCategory = yup.object({
  title: yup.string().required("Title is required"),
  description: yup.string().optional(),
  seoTitle: yup.string().optional(),
  seoDescription: yup.string().optional(),
});

export const updateServiceCategory = yup.object({
  title: yup.string().required("Title is required"),
  description: yup.string().optional(),
  seoTitle: yup.string().optional(),
  seoDescription: yup.string().optional(),
});

export const storeService = yup.object({
  servicesCategoryId: yup.string().required("Service category is required"),
  title: yup.string().required("Title is required"),
  description: yup.string().optional(),
  seoTitle: yup.string().optional(),
  seoDescription: yup.string().optional(),
  mints: yup.string().optional(),
});

export const updateService = yup.object({
  servicesCategoryId: yup.string().required("Service category is required"),
  title: yup.string().required("Title is required"),
  description: yup.string().optional(),
  seoTitle: yup.string().optional(),
  seoDescription: yup.string().optional(),
  mints: yup.string().optional(),
});

export const storeEmployeeService = yup.object({
  // serviceCategoryId: yup.string().required("Service category is required"),
  // serviceId: yup.string().required("Service is required"),
});

export const updateEmployeeService = yup.object({
  // serviceCategoryId: yup.string().required("Service category is required"),
  // serviceId: yup.string().required("Service is required"),
});

export const storeBooking = yup.object({
  serviceCategoryId: yup.string().required("Service category is required"),
  serviceId: yup.string().required("Service is required"),
  quantity: yup.string().required("Quantity is required"),
  tax: yup.string().required("Tax is required"),
  discount: yup.string().required("Discount is required"),
  totalPrice: yup.string().required("Total price is required"),
});

export const updateBooking = yup.object({
  serviceCategoryId: yup.string().optional(),
  serviceId: yup.string().optional(),
  quantity: yup.string().optional(),
  tax: yup.string().optional(),
  discount: yup.string().optional(),
  totalPrice: yup.string().optional(),
  status: yup.string().oneOf(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]).optional(),
  assignedTo: yup.number().integer().nullable().optional(),
  scheduleSlot: yup.string().max(20).nullable().optional(),
});

export const storePetType = yup.object({
  name: yup.string().required("Pet type name is required"),
});

export const updatePetType = yup.object({
  name: yup.string().required("Pet type name is required"),
});

export const storeScheduleSlot = yup.object({
  startTime: yup.string().required("Start time is required"),
  startAmPM: yup.string().required("Start AM/PM is required"),
  endTime: yup.string().required("End time is required"),
  endAmPM: yup.string().required("End AM/PM is required"),
  status: yup.string().optional(),
});

export const updateScheduleSlot = yup.object({
  slug: yup.string().optional(),
  startTime: yup.string().optional(),
  startAmPM: yup.string().optional(),
  endTime: yup.string().optional(),
  endAmPM: yup.string().optional(),
  status: yup.string().optional(),
});

export const storeGenerateSignupLink = yup.object({
  url: yup.string().required("URL is required"),
  status: yup.string().optional(),
});

export const updateGenerateSignupLink = yup.object({
  url: yup.string().optional(),
  status: yup.string().optional(),
});

export const storePet = yup.object({
  name: yup.string().required("Pet name is required"),
  petTypeId: yup.string().required("Pet type is required"),
  gender: yup.string().required("Gender is required"),
  dob: yup.string().required("Date of birth is required"),
  breed: yup.string().required("Breed is required"),
  weight: yup.string().required("Weight is required"),
  color: yup.string().required("Color is required"),
});

export const updatePet = yup.object({
  name: yup.string().required("Pet name is required"),
  petTypeId: yup.string().required("Pet type is required"),
  gender: yup.string().required("Gender is required"),
  dob: yup.string().required("Date of birth is required"),
  breed: yup.string().required("Breed is required"),
  weight: yup.string().required("Weight is required"),
  color: yup.string().required("Color is required"),
});

export const storeTransaction = yup.object({
  userId: yup.number().required("User is required").positive(),
  employeeId: yup.number().required("Employee is required").positive(),
  bookingId: yup.number().required("Booking is required").positive(),
  bookingAmount: yup.mixed().required("Booking amount is required"),
  status: yup.string().optional(),
});

export const storeInvoice = yup.object({
  userId: yup.number().required("User is required").positive(),
  invoiceAmount: yup
    .number()
    .required("Invoice amount is required")
    .positive("Invoice amount must be greater than zero"),
});

export const updateUserInvoice = yup.object({
  comments: yup.string().trim().required("Message is required"),
  modeOfPayment: yup
    .string()
    .trim()
    .oneOf(["zelle", "cashapp", "venmo"], "Mode of Payment is required")
    .required("Mode of Payment is required"),
  transactionId: yup.string().trim().required("Transaction ID is required"),
  attachments: yup.string().trim().nullable().notRequired(),
});

export const updateAdminInvoice = yup.object({
  isPaid: yup.boolean().required("Admin payment status is required"),
});