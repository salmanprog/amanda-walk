import type { Prisma, EmployeeServices } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import {
  storeEmployeeService,
  updateEmployeeService,
  changePassword,
} from "@/validators/user.validation";
import EmployeeServiceResource from "@/resources/EmployeeServiceResource";
import { NextResponse } from "next/server";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { generateSlug } from "@/utils/slug";
import { createUserToken, getUserByToken } from "@/utils/token";
import EmployeeServiceHook from "@/hooks/EmployeeServiceHook";

export type ExtendedEmployeeService = EmployeeServices;

export default class AdminEmployeeServiceController extends RestController<
  Prisma.EmployeeServicesDelegate<DefaultArgs>,
  ExtendedEmployeeService & { servicePrice: string }
> {
  constructor(req?: Request, data?: Partial<ExtendedEmployeeService>) {
    super(
      prisma.employeeServices as unknown as Prisma.EmployeeServicesDelegate<DefaultArgs> & {
        findMany: (...args: unknown[]) => Promise<unknown>;
        findUnique?: (...args: unknown[]) => Promise<unknown>;
        create?: (...args: unknown[]) => Promise<unknown>;
        update?: (...args: unknown[]) => Promise<unknown>;
        delete?: (...args: unknown[]) => Promise<unknown>;
      },
      req
    );

    this.data = data ?? {};
    this.resource = EmployeeServiceResource;
    this.hook = EmployeeServiceHook;
  }

  // ---------------- VALIDATION ----------------
  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storeEmployeeService, this.data ?? {});
      case "update":
        return await this.__validate(updateEmployeeService, this.data ?? {});
    }
  }

  // ---------------- BEFORE INDEX ----------------
  protected async beforeIndex(): Promise<void | NextResponse> {
    const currentUser = this.getCurrentUser();
  }

  // ---------------- BEFORE SHOW ----------------
  protected async beforeShow(): Promise<void | NextResponse> {
    // custom auth logic if needed
  }

  // ---------------- BEFORE STORE ----------------
  protected async beforeStore(): Promise<void | NextResponse> {
    const current_user = this.requireUser();
    if (this.data?.serviceCategoryId) {
      this.data.slug = await generateSlug("employeeServices" as any, String(this.data.serviceCategoryId));
    }

    if (this.data?.serviceCategoryId !== undefined) {
      this.data.serviceCategoryId = Number(this.data.serviceCategoryId);
    }

    if (this.data?.serviceId !== undefined) {
      this.data.serviceId = Number(this.data.serviceId);
    }

    if (current_user?.id) {
      this.data!.userId = current_user.id as number;
    }
  }

  // ---------------- BEFORE UPDATE ----------------
  protected async beforeUpdate(): Promise<void | NextResponse> {
    const current_user = this.requireUser();
    const idParam = this.getRouteParam();
    const routeId = idParam ? parseInt(idParam.toString(), 10) : 0;

    // Example access rule: userGroupId = 3 → restricted employee
    if (
      parseInt(current_user.userGroupId, 10) == 3 &&
      parseInt(current_user.id, 10) !== routeId
    ) {
      return this.sendError(
        "Validation failed",
        { authentication: "You can't update another employee's service." },
        422
      );
    }

    if (this.data?.serviceCategoryId !== undefined) {
      this.data.serviceCategoryId = Number(this.data.serviceCategoryId);
    }

    if (this.data?.serviceId !== undefined) {
      this.data.serviceId = Number(this.data.serviceId);
    }
    
  }

  // ---------------- AFTER UPDATE ----------------
  protected async afterUpdate(
    record: ExtendedEmployeeService & { servicePrice: string }
  ): Promise<ExtendedEmployeeService & { servicePrice: string }> {
    return record;
  }

  // ---------------- BEFORE DESTROY ----------------
  protected async beforeDestroy(): Promise<void | NextResponse> {
    // add delete validation if needed
  }
}
