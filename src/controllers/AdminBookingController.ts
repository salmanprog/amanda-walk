import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";
import AdminBookingHook from "@/hooks/AdminBookingHook";
import AdminBookingResource from "@/resources/AdminBookingResource";
import { storeBooking, updateBooking } from "@/validators/user.validation";
import type { ExtendedBooking } from "@/resources/AdminBookingResource";

export default class AdminBookingController extends RestController<
  any,
  ExtendedBooking
> {
  constructor(req?: Request, data?: Partial<ExtendedBooking>) {
    super(
      (prisma as any).booking as any,
      req
    );

    this.data = data ?? {};
    this.resource = AdminBookingResource;
    this.hook = AdminBookingHook;
  }

  // ------------------- Validation -------------------
  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storeBooking, this.data ?? {});
      case "update":
        return await this.__validate(updateBooking, this.data ?? {});
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
  }

  protected async afterStore(record: ExtendedBooking): Promise<ExtendedBooking> {
    return record;
  }

  protected async beforeUpdate(): Promise<void | NextResponse> {
  }

  protected async afterUpdate(record: ExtendedBooking): Promise<ExtendedBooking> {
    return record;
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    const currentUser = this.requireUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
  }
}

