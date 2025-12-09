import BaseResource from "@/resources/BaseResource";

// Extend Blog type to include relations
export type ExtendedBlog = {
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

export default class AdminBlogResource extends BaseResource<ExtendedBlog> {
  
  // Transform a single record
  async toArray(blog: ExtendedBlog): Promise<Record<string, unknown>> {
    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      description: blog.description,
      imageUrl: blog.imageUrl
        ? `${process.env.NEXT_PUBLIC_APP_URL || ""}${blog.imageUrl}`
        : null,
      seoTitle: blog.seoTitle,
      seoDescription: blog.seoDescription,
      status: blog.status,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    };
  }

  // Transform a collection of records
  async collection(records: ExtendedBlog[]): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map(r => this.toArray(r)));
  }
}

