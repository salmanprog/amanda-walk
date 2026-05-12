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
  user?: {
    name?: string | null;
    lname?: string | null;
    email?: string | null;
    mobileNumber?: string | null;
    emergencyname?: string | null;
    emergencyNumber?: string | null;
    streetAddress?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
    vetName?: string | null;
  } | null;
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

function trimmedStr(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
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

/** One entry per distinct pet appearing on booking schedules (for admin/detail UIs). */
function uniquePetsFromSchedules(
  schedules: ExtendedBooking["schedules"]
): Array<Record<string, unknown>> {
  const seen = new Set<number>();
  const out: Array<Record<string, unknown>> = [];
  for (const s of schedules ?? []) {
    const pet = s.pet;
    if (pet?.id == null) continue;
    if (seen.has(pet.id)) continue;
    const m = mapPetFields(pet);
    if (!m) continue;
    seen.add(pet.id);
    out.push({
      id: pet.id,
      name: m.petName ?? "—",
      breed: m.petBreed,
      gender: m.petGender,
      dob: m.petDob,
      weight: m.petWeight,
      color: m.petColor,
      notes: m.petNotes,
      petTypeName: m.petTypeName,
    });
  }
  return out;
}

export default class AdminBookingResource extends BaseResource<ExtendedBooking> {
  
  // Transform a single record
  async toArray(booking: ExtendedBooking): Promise<Record<string, unknown>> {
    const u = booking.user;
    const userName = u
      ? [u.name, u.lname].filter(Boolean).join(" ") || "—"
      : "—";
    const userEmail = u?.email ?? null;
    const userPhone = u?.mobileNumber ?? null;
    const emergencyContactName = trimmedStr(u?.emergencyname);
    const emergencyContactPhone = trimmedStr(u?.emergencyNumber);
    const streetAddress = trimmedStr(u?.streetAddress);
    const city = trimmedStr(u?.city);
    const state = trimmedStr(u?.state);
    const postalCode = trimmedStr(u?.postalCode);
    const country = trimmedStr(u?.country);
    const vetName = trimmedStr(u?.vetName);
    const addressPieces = [
      streetAddress,
      city,
      state,
      postalCode,
      country,
    ].filter((x): x is string => x != null && x !== "");
    const registrationAddressLine =
      addressPieces.length > 0 ? addressPieces.join(", ") : null;
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
      emergencyContactName,
      emergencyContactPhone,
      emergencyname: emergencyContactName,
      emergencyNumber: emergencyContactPhone,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      registrationAddressLine,
      vetName,
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
      pets: uniquePetsFromSchedules(booking.schedules),
    };
  }

  // Transform a collection of records
  async collection(records: ExtendedBooking[]): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map(r => this.toArray(r)));
  }
}

