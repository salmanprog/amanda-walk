import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";
import AdminServiceCategoryResource from "@/resources/AdminServiceCategoryResources";
import { storeServiceCategory, updateServiceCategory } from "@/validators/user.validation";
import { generateSlug } from "@/utils/slug";
import type { ExtendedAdminServiceCategory } from "@/resources/AdminServiceCategoryResources";
import AdminServiceCategoryHook from "@/hooks/AdminServiceCategoryHook";

export default class AdminServiceCategoryController extends RestController<
  any,
  ExtendedAdminServiceCategory
> {
  constructor(req?: Request, data?: Partial<ExtendedAdminServiceCategory>) {
    super(
      (prisma as any).serviceCategory as any,
      req
    );

    this.data = data ?? {};
    this.resource = AdminServiceCategoryResource;
    this.hook = AdminServiceCategoryHook;
  }

  // ------------------- Validation -------------------
  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storeServiceCategory, this.data ?? {});
      case "update":
        return await this.__validate(updateServiceCategory, this.data ?? {});
    }
  }

  // ------------------- Hooks -------------------
  protected async beforeIndex(): Promise<void | NextResponse> {
    this.getCurrentUser(); // can log if needed
  }

  protected async beforeShow(): Promise<void | NextResponse> {
    // Optional: Add authorization checks here
  }

  protected async beforeStore(): Promise<void | NextResponse> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
    if (this.data?.title) {
      this.data.slug = await generateSlug("serviceCategory" as any, this.data.title);
    }
    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }
  }

  protected async afterStore(record: ExtendedAdminServiceCategory): Promise<ExtendedAdminServiceCategory> {
    return record;
  }

  protected async beforeUpdate(): Promise<void | NextResponse> {
    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }
  }

  protected async afterUpdate(record: ExtendedAdminServiceCategory): Promise<ExtendedAdminServiceCategory> {
    return record;
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    const currentUser = this.requireUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
  }
}

