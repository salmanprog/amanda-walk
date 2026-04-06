"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/utils/currentUser";
import useApi, { ApiResponse } from "@/utils/useApi";
import InnerBanner from "@/components/common/InnerBanner";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { MessageCircle } from "lucide-react";

function formatBookingScheduleDate(v: string | Date | null | undefined): string {
  if (v == null || v === "") return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function displayScheduleSlotOrTime(
  slot: string | null | undefined,
  time: string | null | undefined
): string {
  if (slot != null && String(slot).trim() !== "") return String(slot).trim();
  if (time != null && String(time).trim() !== "") return String(time).trim();
  return "—";
}

function firstNonEmptyStr(
  a: string | null | undefined,
  b: string | null | undefined
): string {
  const t = (v: string | null | undefined) =>
    v != null && String(v).trim() !== "" ? String(v).trim() : "";
  return t(a) || t(b);
}

interface AccountUser {
  id: number;
  name: string | null;
  email: string | null;
  mobileNumber?: string | null;
  imageUrl?: string | null;
  dob?: string | null;
  gender?: string | null;
  createdAt?: string;
  [key: string]: any;
}

export default function AccountPage() {
  const router = useRouter();
  const { user: currentUser, loadingUser, errorUser } = useCurrentUser();
  const user = currentUser as AccountUser | null;
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "booking">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Helper function to normalize image URL
  const normalizeImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    // If it's already a relative path, return as is
    if (url.startsWith('/')) return url;
    // If it's a full URL, extract the path
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      // If URL parsing fails, assume it's a relative path
      return url.startsWith('/') ? url : `/${url}`;
    }
  };

  // Update form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        mobileNumber: user.mobileNumber || "",
      });
      if (user.imageUrl) {
        const normalizedUrl = normalizeImageUrl(user.imageUrl);
        setImagePreview(normalizedUrl);
      }
    }
  }, [user]);

  // Set page title
  useEffect(() => {
    document.title = "Amanda | My Account";
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!loadingUser && !user && !errorUser) {
      router.push("/login");
    }
  }, [user, loadingUser, errorUser, router]);

  const { sendData, loading: apiLoading } = useApi({
    url: user ? `/api/users/profile/${user.id}` : "",
    type: "manual",
    method: "PATCH",
    requiresAuth: true,
  });

  const { sendData: sendPasswordData, loading: passwordLoading } = useApi({
    url: "/api/users/password",
    type: "manual",
    method: "POST",
    requiresAuth: true,
  });

  const { data: bookingsData, fetchApi: fetchBookings, loading: loadingBookings } = useApi({
    url: "/api/users/booking",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  type BookingItem = {
    id: number;
    userId?: number;
    assignedTo?: number | null;
    assignedEmployeeName?: string | null;
    assignedEmployeeEmail?: string | null;
    assignedEmployeePhone?: string | null;
    petId?: number | null;
    petName?: string | null;
    petBreed?: string | null;
    petGender?: string | null;
    petDob?: string | null;
    petWeight?: string | null;
    petColor?: string | null;
    petNotes?: string | null;
    petTypeName?: string | null;
    serviceCategoryId?: number;
    serviceId?: number;
    userName?: string;
    userEmail?: string | null;
    userPhone?: string | null;
    categoryName?: string;
    serviceName?: string;
    serviceMints?: string | null;
    quantity?: number;
    tax?: number;
    discount?: number;
    totalPrice: number;
    isPaid?: boolean;
    status: string;
    createdAt?: string | null;
    updatedAt?: string | null;
    scheduleDate?: string | null;
    scheduleTime?: string | null;
    scheduleSlot?: string | null;
    isStarted?: boolean;
    isCompleted?: boolean;
    schedules?: Array<{
      id?: number;
      employeeId?: number;
      employeeName?: string | null;
      employeeEmail?: string | null;
      employeePhone?: string | null;
      scheduleDate?: string | Date | null;
      scheduleTime?: string | null;
      scheduleSlot?: string | null;
      isStarted?: boolean;
      isCompleted?: boolean;
      petId?: number | null;
      petName?: string | null;
      petBreed?: string | null;
      petGender?: string | null;
      petDob?: string | null;
      petWeight?: string | null;
      petColor?: string | null;
      petNotes?: string | null;
      petTypeName?: string | null;
    }>;
  };

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [viewBookingDetails, setViewBookingDetails] = useState<BookingItem | null>(null);

  const bookingDetailsContactEmail = useMemo(() => {
    if (!viewBookingDetails) return "";
    const raw = viewBookingDetails.userEmail;
    if (raw != null && String(raw).trim() !== "") return String(raw).trim();
    if (
      user &&
      viewBookingDetails.userId != null &&
      Number(viewBookingDetails.userId) === Number(user.id) &&
      user.email != null &&
      String(user.email).trim() !== ""
    ) {
      return String(user.email).trim();
    }
    return "";
  }, [viewBookingDetails, user]);

  const bookingDetailsContactPhone = useMemo(() => {
    if (!viewBookingDetails) return "";
    const raw = viewBookingDetails.userPhone;
    if (raw != null && String(raw).trim() !== "") return String(raw).trim();
    if (
      user &&
      viewBookingDetails.userId != null &&
      Number(viewBookingDetails.userId) === Number(user.id)
    ) {
      const m =
        user.mobileNumber ??
        (user as AccountUser & { phone?: string | null }).phone;
      if (m != null && String(m).trim() !== "") return String(m).trim();
    }
    return "";
  }, [viewBookingDetails, user]);

  const bookingPetDisplay = useMemo(() => {
    if (!viewBookingDetails) {
      return { petName: "", petTypeName: "", petBreed: "", petGender: "" };
    }
    const row = viewBookingDetails.schedules?.[0];
    return {
      petName: firstNonEmptyStr(viewBookingDetails.petName, row?.petName),
      petTypeName: firstNonEmptyStr(
        viewBookingDetails.petTypeName,
        row?.petTypeName
      ),
      petBreed: firstNonEmptyStr(viewBookingDetails.petBreed, row?.petBreed),
      petGender: firstNonEmptyStr(
        viewBookingDetails.petGender,
        row?.petGender
      ),
    };
  }, [viewBookingDetails]);

  useEffect(() => {
    if (activeTab === "booking") fetchBookings();
  }, [activeTab]);

  useEffect(() => {
    if (bookingsData && Array.isArray(bookingsData)) {
      setBookings(bookingsData);
    }
  }, [bookingsData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }   
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateProfileForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.mobileNumber && !/^\d{10,15}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Please enter a valid mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateProfileForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      // Always send mobileNumber, even if empty (to allow clearing it)
      formDataToSend.append("mobileNumber", formData.mobileNumber || "");

      // Add image if a new one was selected
      const imageInput = document.getElementById("image") as HTMLInputElement;
      if (imageInput?.files?.[0]) {
        formDataToSend.append("image", imageInput.files[0]);
      }

      const res: ApiResponse = await sendData(formDataToSend, undefined, "PATCH");

      if (res.code === 200) {
        setSuccessMessage("Profile updated successfully!");
        setIsEditing(false);
        // Reload page to get updated user data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setErrorMessage(res.message || "Failed to update profile");
        if (res.data && typeof res.data === "object") {
          setErrors(res.data as Record<string, string>);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Something went wrong. Please try again.");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validatePasswordForm()) return;

    try {
      const payload = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      };

      const res: ApiResponse = await sendPasswordData(payload, undefined, "POST");

      if (res.code === 200) {
        setSuccessMessage("Password changed successfully!");
        // Clear form
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setErrors({});
      } else {
        setErrorMessage(res.message || "Failed to change password");
        if (res.data && typeof res.data === "object") {
          setErrors(res.data as Record<string, string>);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Something went wrong. Please try again.");
    }
  };

  // Show loading only if we're actually loading AND don't have user data
  if (loadingUser && !user) {
    return (
      <>
        <InnerBanner title="" bannerClass="account-banner" />
        <section className="py-20">
          <div className="container">
            <div className="text-center">Loading...</div>
          </div>
        </section>
      </>
    );
  }

  // If no user after loading completes, don't render (will redirect)
  if (!loadingUser && !user) {
    return null; // Will redirect via useEffect
  }

  // If we have user data, show the page (even if still loading in background)
  if (!user) {
    return null;
  }

  return (
    <>
      {/* <InnerBanner title="My Account" bannerClass="account-banner" /> */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === "profile"
                    ? "text-[var(--primary-theme)] border-b-2 border-[var(--primary-theme)]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === "password"
                    ? "text-[var(--primary-theme)] border-b-2 border-[var(--primary-theme)]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Change Password
              </button>
              <button
                onClick={() => setActiveTab("booking")}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === "booking"
                    ? "text-[var(--primary-theme)] border-b-2 border-[var(--primary-theme)]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Booking
              </button>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {errorMessage}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                {!isEditing ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                      <Button onClick={() => setIsEditing(true)} size="sm">
                        Edit Profile
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {/* Profile Image */}
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          {imagePreview ? (
                            <Image
                              src={imagePreview}
                              alt="Profile"
                              width={120}
                              height={120}
                              className="rounded-full object-cover"
                              unoptimized={imagePreview.startsWith('data:') || imagePreview.includes('localhost')}
                            />
                          ) : (
                            <div className="w-[120px] h-[120px] rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-4xl text-gray-600">
                                {user.name?.[0]?.toUpperCase() || "U"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Profile Picture</p>
                        </div>
                      </div>

                      {/* User Info Display */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label>Name</Label>
                          <p className="mt-1 text-gray-900 font-medium">{user.name || "Not set"}</p>
                        </div>
                        <div>
                          <Label>Email</Label>
                          <p className="mt-1 text-gray-900 font-medium">{user.email || "Not set"}</p>
                        </div>
                        <div>
                          <Label>Mobile Number</Label>
                          <p className="mt-1 text-gray-900 font-medium">
                            {user.mobileNumber || "Not set"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setErrors({});
                          setErrorMessage("");
                          setSuccessMessage("");
                        }}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>

                    {/* Profile Image Upload */}
                    <div>
                      <Label>Profile Picture</Label>
                      <div className="mt-2 flex items-center gap-4">
                        {imagePreview ? (
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            width={100}
                            height={100}
                            className="rounded-full object-cover"
                            unoptimized={imagePreview.startsWith('data:') || imagePreview.includes('localhost')}
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-2xl text-gray-600">
                              {formData.name?.[0]?.toUpperCase() || "U"}
                            </span>
                          </div>
                        )}
                        <div>
                          <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary-theme)] file:text-white hover:file:bg-[var(--secondary-theme)]"
                          />
                          <p className="mt-1 text-xs text-gray-500">Max size: 5MB</p>
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name">
                          Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          error={!!errors.name}
                          hint={errors.name}
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={user?.email || ""}
                          disabled={true}
                        />
                        <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                      </div>

                      <div>
                        <Label htmlFor="mobileNumber">Mobile Number</Label>
                        <Input
                          id="mobileNumber"
                          name="mobileNumber"
                          type="tel"
                          value={formData.mobileNumber}
                          onChange={handleInputChange}
                          error={!!errors.mobileNumber}
                          hint={errors.mobileNumber}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setErrors({});
                          setErrorMessage("");
                          setSuccessMessage("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={apiLoading}>
                        {apiLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Booking Tab */}
            {activeTab === "booking" && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h2>
                <div className="max-w-full overflow-x-auto">
                  {loadingBookings ? (
                    <p className="text-gray-500 py-4">Loading bookings...</p>
                  ) : bookings.length === 0 ? (
                    <p className="text-gray-500 py-4">No bookings yet.</p>
                  ) : (
                    <Table>
                      <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                          <TableCell
                            isHeader
                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            ID
                          </TableCell>
                          <TableCell
                            isHeader
                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            Category
                          </TableCell>
                          <TableCell
                            isHeader
                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            Service
                          </TableCell>
                          <TableCell
                            isHeader
                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            Total
                          </TableCell>
                          <TableCell
                            isHeader
                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            Status
                          </TableCell>
                          <TableCell
                            isHeader
                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                              {booking.id}
                            </TableCell>
                            <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                              {booking.categoryName ?? "—"}
                            </TableCell>
                            <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                              {booking.serviceName ?? "—"}
                            </TableCell>
                            <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                              ${Number(booking.totalPrice).toFixed(2)}
                            </TableCell>
                            <TableCell className="py-3">
                              <Badge
                                size="sm"
                                color={
                                  booking.status === "PENDING"
                                    ? "warning"
                                    : booking.status === "CANCELLED"
                                      ? "error"
                                      : "success"
                                }
                              >
                                {booking.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-3">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="!py-1.5 !px-3 text-theme-xs"
                                onClick={() => setViewBookingDetails(booking)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>

                {/* Booking details modal */}
                {viewBookingDetails && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
                    onClick={() => setViewBookingDetails(null)}
                  >
                    <div
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full p-6 border border-gray-200 dark:border-gray-700 my-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-center mb-4" >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Booking #{viewBookingDetails.id}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="inline-flex items-center gap-1.5"
                            onClick={() => {
                              setViewBookingDetails(null);
                              router.push(`/chat?bookingId=${viewBookingDetails.id}`);
                            }}
                          >
                            <MessageCircle className="h-4 w-4" aria-hidden />
                            Chat with employee
                          </Button>
                          <button
                            type="button"
                            onClick={() => setViewBookingDetails(null)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none"
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-6">
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">User name</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">
                            {viewBookingDetails.userName ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Email</dt>
                          <dd className="font-medium text-gray-900 dark:text-white break-all">
                            {bookingDetailsContactEmail || "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Phone</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">
                            {bookingDetailsContactPhone || "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Category</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">
                            {viewBookingDetails.categoryName ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Service</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">
                            {viewBookingDetails.serviceName ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Service duration</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">
                            {viewBookingDetails.serviceMints != null &&
                            String(viewBookingDetails.serviceMints).trim() !== ""
                              ? String(viewBookingDetails.serviceMints).trim()
                              : "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Schedule date</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">
                            {formatBookingScheduleDate(
                              viewBookingDetails.scheduleDate ?? undefined
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Schedule time</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">
                            {displayScheduleSlotOrTime(
                              viewBookingDetails.scheduleSlot,
                              viewBookingDetails.scheduleTime
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Assigned employee name</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">
                            {viewBookingDetails.assignedEmployeeName != null &&
                            String(viewBookingDetails.assignedEmployeeName).trim() !== ""
                              ? String(viewBookingDetails.assignedEmployeeName).trim()
                              : "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Assigned employee email</dt>
                          <dd className="font-medium text-gray-900 dark:text-white break-all">
                            {viewBookingDetails.assignedEmployeeEmail != null &&
                            String(viewBookingDetails.assignedEmployeeEmail).trim() !== ""
                              ? String(viewBookingDetails.assignedEmployeeEmail).trim()
                              : "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Pet name</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">
                            {bookingPetDisplay.petName || "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Pet type</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">
                            {bookingPetDisplay.petTypeName || "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Breed</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">
                            {bookingPetDisplay.petBreed || "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Gender</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">
                            {bookingPetDisplay.petGender || "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Walk started</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">
                            {viewBookingDetails.isStarted != null
                              ? viewBookingDetails.isStarted
                                ? "Yes"
                                : "No"
                              : "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Walk completed</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">
                            {viewBookingDetails.isCompleted != null
                              ? viewBookingDetails.isCompleted
                                ? "Yes"
                                : "No"
                              : "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Total</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">
                            ${Number(viewBookingDetails.totalPrice).toFixed(2)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400">Status</dt>
                          <dd>
                            <Badge
                              size="sm"
                              color={
                                viewBookingDetails.status === "PENDING"
                                  ? "warning"
                                  : viewBookingDetails.status === "CANCELLED"
                                    ? "error"
                                    : "success"
                              }
                            >
                              {viewBookingDetails.status}
                            </Badge>
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-6">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setViewBookingDetails(null)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                  <div>
                    <Label htmlFor="currentPassword">
                      Current Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      error={!!errors.currentPassword}
                      hint={errors.currentPassword}
                    />
                  </div>

                  <div>
                    <Label htmlFor="newPassword">
                      New Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      error={!!errors.newPassword}
                      hint={errors.newPassword}
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">
                      Confirm New Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      error={!!errors.confirmPassword}
                      hint={errors.confirmPassword}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={passwordLoading}>
                      {passwordLoading ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

