import BaseResource from "@/resources/BaseResource";
import { Gender } from "@prisma/client";

// Extend Blog type to include relations
export type ExtendedPet = {
  id?: number;
  userId: number;
  petTypeId: number;
  name: string;
  slug: string;
  gender: string;
  dob: string;
  breed: string;
  weight: string;
  color: string;
  notes: string;
  description?: string | null;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

export default class AdminPetResource extends BaseResource<ExtendedPet> {
  
  // Transform a single record
  async toArray(pet: ExtendedPet): Promise<Record<string, unknown>> {
    return {
      id: pet.id,
      userId: pet.userId,
      petTypeId: pet.petTypeId,
      name: pet.name,
      gender: pet.gender as Gender,
      dob: pet.dob,
      breed: pet.breed,
      weight: pet.weight,
      color: pet.color,
      notes: pet.notes,
      slug: pet.slug,
      description: pet.description,
      status: pet.status,
      createdAt: pet.createdAt,
      updatedAt: pet.updatedAt,
    };
  }

  // Transform a collection of records
  async collection(records: ExtendedPet[]): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map(r => this.toArray(r)));
  }
}

