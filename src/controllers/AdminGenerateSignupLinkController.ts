import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import { NextResponse } from "next/server";
import AdminGenerateSignupLinkHook from "@/hooks/AdminGenerateSignupLinkHook";
import AdminGenerateSignupLinkResource, {
  type ExtendedGenerateSignupLink,
} from "@/resources/AdminGenerateSignupLinkResource";
import {
  storeGenerateSignupLink,
  updateGenerateSignupLink,
} from "@/validators/user.validation";
import { generateSlug } from "@/utils/slug";

export default class AdminGenerateSignupLinkController extends RestController<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  ExtendedGenerateSignupLink
> {
  constructor(req?: Request, data?: Partial<ExtendedGenerateSignupLink>) {
    super((prisma as any).generate_signup_links as any, req);

    this.data = data ?? {};
    this.resource = AdminGenerateSignupLinkResource;
    this.hook = AdminGenerateSignupLinkHook;
  }

  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storeGenerateSignupLink, this.data ?? {});
      case "update":
        return await this.__validate(
          updateGenerateSignupLink,
          this.data ?? {}
        );
    }
  }

  protected async beforeIndex(): Promise<void | NextResponse> {
    this.getCurrentUser();
  }

  protected async beforeStore(): Promise<void | NextResponse> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return this.sendError(
        "Unauthorized",
        { auth: "User not logged in" },
        401
      );
    }
    this.data = this.data ?? {};
    if (this.data.status !== undefined) {
      const s = this.data.status;
      this.data.status = s === true || String(s) === "1";
    }

    const url = this.data.url != null ? String(this.data.url).trim() : "";
    const seed =
      url.replace(/^https?:\/\//i, "").slice(0, 120) || "signup-link";
    this.data.slug = await generateSlug(
      "generate_signup_links" as keyof typeof prisma,
      seed
    );
  }

  protected async afterStore(
    record: ExtendedGenerateSignupLink
  ): Promise<ExtendedGenerateSignupLink> {
    return record;
  }

  protected async beforeUpdate(): Promise<void | NextResponse> {
    if (this.data?.status !== undefined) {
      const s = this.data.status;
      this.data.status = s === true || String(s) === "1";
    }
  }

  protected async afterUpdate(
    record: ExtendedGenerateSignupLink
  ): Promise<ExtendedGenerateSignupLink> {
    return record;
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    const currentUser = this.requireUser();
    if (!currentUser) {
      return this.sendError(
        "Unauthorized",
        { auth: "User not logged in" },
        401
      );
    }
  }
}
