import * as yup from "yup";

export const storeUser = yup.object({
  name: yup.string().required("Name is required").min(2).max(20),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6).max(100).required("Password is required"),
});

export const updateUser = yup.object({
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
});

export const updateService = yup.object({
  servicesCategoryId: yup.string().required("Service category is required"),
  title: yup.string().required("Title is required"),
  description: yup.string().optional(),
  seoTitle: yup.string().optional(),
  seoDescription: yup.string().optional(),
});
