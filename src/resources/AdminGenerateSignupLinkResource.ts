import BaseResource from "@/resources/BaseResource";

export type ExtendedGenerateSignupLink = {
  id?: number;
  slug: string;
  url: string;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

export default class AdminGenerateSignupLinkResource extends BaseResource<ExtendedGenerateSignupLink> {
  async toArray(
    record: ExtendedGenerateSignupLink
  ): Promise<Record<string, unknown>> {
    return {
      id: record.id,
      slug: record.slug,
      url: record.url,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async collection(
    records: ExtendedGenerateSignupLink[]
  ): Promise<Record<string, unknown>[]> {
    return Promise.all(records.map((r) => this.toArray(r)));
  }
}
