import BaseResource from "@/resources/BaseResource";

// Extend Blog type to include relations
export type ExtendedPetType = {
  id?: number;
  name: string;
  slug: string;
  description?: string | null;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

export default class AdminPetTypeResource extends BaseResource<ExtendedPetType> {
  
  // Transform a single record
  async toArray(petType: ExtendedPetType): Promise<Record<string, unknown>> {
    return {
      id: petType.id,
      name: petType.name,
      slug: petType.slug,
      description: petType.description,
      status: petType.status,
      createdAt: petType.createdAt,
      updatedAt: petType.updatedAt,
    };
  }

  // Transform a collection of records
  async collection(records: ExtendedPetType[]): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map(r => this.toArray(r)));
  }
}

