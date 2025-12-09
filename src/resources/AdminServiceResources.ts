import BaseResource from "@/resources/BaseResource";
import { User, ServiceCategory } from "@prisma/client";

export type ExtendedAdminService = {
  id?: number;
  userId: number;
  servicesCategoryId: number;
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

  user: User;
  category: ServiceCategory;
};

export default class AdminServiceResource extends BaseResource<ExtendedAdminService> {

  async toArray(service: ExtendedAdminService): Promise<Record<string, unknown>> {
    return {
      id: service.id,
      title: service.title,
      slug: service.slug,
      description: service.description,
      imageUrl: service.imageUrl
        ? `${process.env.NEXT_PUBLIC_APP_URL || ""}${service.imageUrl}`
        : null,
      servicesCategoryId: service.servicesCategoryId,
      seoTitle: service.seoTitle,
      seoDescription: service.seoDescription,
      status: service.status,

      user: service.user ? {
        id: service.user.id,
        name: service.user.name,
        slug: service.user.slug,
      } : null,

      category: service.category ? {
        id: service.category.id,
        title: service.category.title,
        slug: service.category.slug,
      } : null,

      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }

  async collection(records: ExtendedAdminService[]): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map(r => this.toArray(r)));
  }
}
