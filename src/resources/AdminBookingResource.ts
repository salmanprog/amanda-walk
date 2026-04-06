import BaseResource from "@/resources/BaseResource";
import { BookingStatus as BookingStatusEnum } from "@prisma/client";

// Extend Booking type to include relations
export type ExtendedBooking = {
  id?: number;
  userId: number;
  assignedTo: number;
  serviceCategoryId: number;
  serviceId: number;
  quantity: number;
  tax: number;
  discount: number;
  totalPrice: number;
  isPaid: boolean;
  status: BookingStatusEnum;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  user?: { name?: string | null; lname?: string | null; email?: string | null; mobileNumber?: string | null } | null;
  assignedUser?: {
    id?: number;
    name?: string | null;
    lname?: string | null;
    email?: string | null;
    mobileNumber?: string | null;
  } | null;
  category?: { title?: string } | null;
  service?: { title?: string; mints?: string } | null;
  schedules?: Array<{
    id?: number;
    employeeId: number;
    petId: number;
    scheduleDate: Date;
    scheduleTime: string;
    scheduleSlot?: string | null;
    isStarted: boolean;
    isCompleted: boolean;
    employee?: {
      id?: number;
      name?: string | null;
      lname?: string | null;
      email?: string | null;
      mobileNumber?: string | null;
    } | null;
    pet?: {
      id?: number;
      name?: string;
      breed?: string | null;
      gender?: string;
      dob?: string;
      weight?: unknown;
      color?: string | null;
      notes?: string | null;
      petType?: { name?: string } | null;
    } | null;
  }>;
};

function personDisplayName(
  p: { name?: string | null; lname?: string | null } | null | undefined
): string | null {
  if (!p) return null;
  const n = [p.name, p.lname].filter(Boolean).join(" ").trim();
  return n !== "" ? n : null;
}

function mapPetFields(
  pet:
    | {
        id?: number;
        name?: string;
        breed?: string | null;
        gender?: string;
        dob?: string;
        weight?: unknown;
        color?: string | null;
        notes?: string | null;
        petType?: { name?: string } | null;
      }
    | null
    | undefined
): Record<string, unknown> | null {
  if (!pet) return null;
  const w = pet.weight;
  const weightStr = w == null || w === "" ? null : String(w);
  return {
    petName: pet.name != null ? String(pet.name) : null,
    petBreed: pet.breed != null ? String(pet.breed) : null,
    petGender: pet.gender != null ? String(pet.gender) : null,
    petDob: pet.dob != null ? String(pet.dob) : null,
    petWeight: weightStr,
    petColor: pet.color != null ? String(pet.color) : null,
    petNotes: pet.notes != null ? String(pet.notes) : null,
    petTypeName:
      pet.petType?.name != null ? String(pet.petType.name) : null,
  };
}

export default class AdminBookingResource extends BaseResource<ExtendedBooking> {
  
  // Transform a single record
  async toArray(booking: ExtendedBooking): Promise<Record<string, unknown>> {
    const userName = booking.user
      ? [booking.user.name, booking.user.lname].filter(Boolean).join(" ") || "—"
      : "—";
    const userEmail = booking.user?.email ?? null;
    const userPhone = booking.user?.mobileNumber ?? null;
    const au = booking.assignedUser;
    const assignedEmployeeName = personDisplayName(au);
    const assignedEmployeeEmail = au?.email ?? null;
    const assignedEmployeePhone = au?.mobileNumber ?? null;
    const categoryName = booking.category?.title ?? "—";
    const serviceName = booking.service?.title ?? "—";
    const mintsRaw = booking.service?.mints;
    const mintsStr = mintsRaw != null ? String(mintsRaw).trim() : "";
    const serviceMints = mintsStr !== "" ? mintsStr : null;
    const firstSchedule = booking.schedules?.[0];
    const firstPet = mapPetFields(firstSchedule?.pet);
    const firstPetId =
      firstSchedule?.pet?.id ??
      (firstSchedule as { petId?: number } | undefined)?.petId ??
      null;
    const schedules = (booking.schedules ?? []).map((s) => {
      const emp = s.employee;
      const petFields = mapPetFields(s.pet);
      return {
        id: (s as { id?: number }).id,
        employeeId: s.employeeId,
        petId: s.petId ?? s.pet?.id ?? null,
        ...(petFields ?? {}),
        employeeName: personDisplayName(emp) ?? null,
        employeeEmail: emp?.email ?? null,
        employeePhone: emp?.mobileNumber ?? null,
        scheduleDate: s.scheduleDate,
        scheduleTime: s.scheduleTime,
        scheduleSlot: (s as { scheduleSlot?: string | null }).scheduleSlot ?? null,
        isStarted: s.isStarted,
        isCompleted: s.isCompleted,
      };
    });
    return {
      id: booking.id,
      userId: booking.userId,
      assignedTo: booking.assignedTo,
      serviceCategoryId: booking.serviceCategoryId,
      serviceId: booking.serviceId,
      userName,
      userEmail,
      userPhone,
      assignedEmployeeName,
      assignedEmployeeEmail,
      assignedEmployeePhone,
      ...(firstPet ?? {}),
      petId: firstPetId,
      categoryName,
      serviceName,
      serviceMints,
      quantity: booking.quantity,
      tax: booking.tax,
      discount: booking.discount,
      totalPrice: booking.totalPrice,
      isPaid: booking.isPaid,
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      deletedAt: booking.deletedAt,
      scheduleDate: firstSchedule?.scheduleDate ?? null,
      scheduleTime: firstSchedule?.scheduleTime ?? null,
      scheduleSlot: firstSchedule?.scheduleSlot ?? null,
      isStarted: firstSchedule?.isStarted ?? false,
      isCompleted: firstSchedule?.isCompleted ?? false,
      schedules,
    };
  }

  // Transform a collection of records
  async collection(records: ExtendedBooking[]): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map(r => this.toArray(r)));
  }
}

