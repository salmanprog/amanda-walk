import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";
import AdminPetTypeHook from "@/hooks/AdminPetTypeHook";
import AdminPetTypeResource from "@/resources/AdminPetTypeResource";
import { storePetType, updatePetType } from "@/validators/user.validation";
import { generateSlug } from "@/utils/slug";
import type { ExtendedPetType } from "@/resources/AdminPetTypeResource";

export default class AdminPetTypeController extends RestController<
  any,
  ExtendedPetType
> {
  constructor(req?: Request, data?: Partial<ExtendedPetType>) {
    super(
      (prisma as any).petType as any,
      req
    );

    this.data = data ?? {};
    this.resource = AdminPetTypeResource;
    this.hook = AdminPetTypeHook;
  }

  // ------------------- Validation -------------------
  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storePetType, this.data ?? {});
      case "update":
        return await this.__validate(updatePetType, this.data ?? {});
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
    if (this.data?.name) {
      this.data.slug = await generateSlug("petType" as any, this.data.name);
    }
    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }
  }

  protected async afterStore(record: ExtendedPetType): Promise<ExtendedPetType> {
    return record;
  }

  protected async beforeUpdate(): Promise<void | NextResponse> {
    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }
  }

  protected async afterUpdate(record: ExtendedPetType): Promise<ExtendedPetType> {
    return record;
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    const currentUser = this.requireUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
  }
}

