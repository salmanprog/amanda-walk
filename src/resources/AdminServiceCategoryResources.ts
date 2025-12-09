import BaseResource from "@/resources/BaseResource";

// Extend Blog type to include relations
export type ExtendedAdminServiceCategory = {
  id?: number;
  title: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

export default class AdminServiceCategoryResource extends BaseResource<ExtendedAdminServiceCategory> {
  
  // Transform a single record
  async toArray(serviceCategory: ExtendedAdminServiceCategory): Promise<Record<string, unknown>> {
    return {
      id: serviceCategory.id,
      title: serviceCategory.title,
      slug: serviceCategory.slug,
      description: serviceCategory.description,
      imageUrl: serviceCategory.imageUrl
        ? `${process.env.NEXT_PUBLIC_APP_URL || ""}${serviceCategory.imageUrl}`
        : null,
      seoTitle: serviceCategory.seoTitle,
      seoDescription: serviceCategory.seoDescription,
      status: serviceCategory.status,
      createdAt: serviceCategory.createdAt,
      updatedAt: serviceCategory.updatedAt,
    };
  }

  // Transform a collection of records
  async collection(records: ExtendedAdminServiceCategory[]): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map(r => this.toArray(r)));
  }
}

