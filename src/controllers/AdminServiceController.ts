import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";
import AdminServiceResource from "@/resources/AdminServiceResources";
import { storeService, updateService } from "@/validators/user.validation";
import { generateSlug } from "@/utils/slug";
import type { ExtendedAdminService } from "@/resources/AdminServiceResources";
import AdminServiceHook from "@/hooks/AdminServiceHook";

export default class AdminServiceController extends RestController<
  any,
  ExtendedAdminService
> {
  constructor(req?: Request, data?: Partial<ExtendedAdminService>) {
    super(
      (prisma as any).services as any,
      req
);

    this.data = data ?? {};
    this.resource = AdminServiceResource
    this.hook = AdminServiceHook;
  }

  // ------------------- Validation -------------------
  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storeService, this.data ?? {});
      case "update":
        return await this.__validate(updateService, this.data ?? {});
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
      this.data.slug = await generateSlug("services" as any, this.data.title);
    }
    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }
    if (this.data?.servicesCategoryId !== undefined) {
      this.data.servicesCategoryId = Number(this.data.servicesCategoryId);
    }
    if (currentUser?.id) {
      this.data!.userId = currentUser.id as number;
    }
  }

  protected async afterStore(record: ExtendedAdminService): Promise<ExtendedAdminService> {
    return record;
  }

  protected async beforeUpdate(): Promise<void | NextResponse> {
    if (this.data?.servicesCategoryId !== undefined) {
      this.data.servicesCategoryId = Number(this.data.servicesCategoryId);
    }
    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }
  }

  protected async afterUpdate(record: ExtendedAdminService): Promise<ExtendedAdminService> {
    return record;
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    const currentUser = this.requireUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
  }
}

