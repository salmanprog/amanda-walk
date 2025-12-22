import type { Gender, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";
import AdminPetHook from "@/hooks/AdminPetHook";
import AdminPetResource from "@/resources/AdminPetResource";
import { storePet, updatePet } from "@/validators/user.validation";
import { generateSlug } from "@/utils/slug";
import type { ExtendedPet } from "@/resources/AdminPetResource";

export default class AdminPetController extends RestController<
  any,
  ExtendedPet
> {
  constructor(req?: Request, data?: Partial<ExtendedPet>) {
    super(
      (prisma as any).pet as any,
      req
    );

    this.data = data ?? {};
    this.resource = AdminPetResource;
    this.hook = AdminPetHook;
  }

  // ------------------- Validation -------------------
  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storePet, this.data ?? {});
      case "update":
        return await this.__validate(updatePet, this.data ?? {});
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
      this.data.slug = await generateSlug("pet" as any, this.data.name);
    }
    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }
    if(this.data?.petTypeId !== undefined) {
      this.data.petTypeId = Number(this.data.petTypeId);
    }
    if(this.data?.gender !== undefined) {
      this.data.gender = String(this.data.gender) as Gender;
    }
    this.data = this.data ?? {};
    (this.data as Record<string, any>).userId = currentUser.id as number;
  }

  protected async afterStore(record: ExtendedPet): Promise<ExtendedPet> {
    return record;
  }

  protected async beforeUpdate(): Promise<void | NextResponse> {
    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }
    if(this.data?.petTypeId !== undefined) {
      this.data.petTypeId = Number(this.data.petTypeId);
    }
    if(this.data?.gender !== undefined) {
      this.data.gender = String(this.data.gender) as Gender;
    }
  }

  protected async afterUpdate(record: ExtendedPet): Promise<ExtendedPet> {
    return record;
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    const currentUser = this.requireUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
  }
}

