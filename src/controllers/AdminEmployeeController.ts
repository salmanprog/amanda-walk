import type { Prisma, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import { storeEmployee, updateEmployee, changePassword } from "@/validators/user.validation";
import EmployeeResource from "@/resources/EmployeeResource";
import { NextRequest, NextResponse } from "next/server";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { generateSlug } from "@/utils/slug";
import { createUserToken, getUserByToken } from "@/utils/token";
import EmployeeHook from "@/hooks/EmployeeHook";  

export type ExtendedEmployee = User & { image?: string };

export default class AdminEmployeeController extends RestController<
  Prisma.UserDelegate<DefaultArgs>,
  ExtendedEmployee
> {
  private _serviceCategoriesTemp: Array<{
    categoryId: number | string;
    services: (number | string)[];
  }> = [];
    constructor(req?: Request, data?: Partial<ExtendedEmployee>) {
      super(prisma.user as unknown as Prisma.UserDelegate<DefaultArgs> & {
        findMany: (...args: unknown[]) => Promise<unknown>;
        findUnique?: (...args: unknown[]) => Promise<unknown>;
        create?: (...args: unknown[]) => Promise<unknown>;
        update?: (...args: unknown[]) => Promise<unknown>;
        delete?: (...args: unknown[]) => Promise<unknown>;
      },req);
      
      this.data = data ?? {};
      this.resource = EmployeeResource;
      this.hook = EmployeeHook;
    }

  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storeEmployee, this.data ?? {});
      case "update":
        return await this.__validate(updateEmployee, this.data ?? {});
    }
  }

  protected async beforeIndex(): Promise<void | NextResponse> {
    const currentUser = this.getCurrentUser();
  }
  protected async beforeShow(): Promise<void | NextResponse> {
    // const user = this.requireUser();
    // const id = this.getRouteParam() ?? "";
    // if(parseInt(user.id) != parseInt(id)){
    //     return this.sendError("Validation failed", { authentication: "You don't have an other profile" }, 422);
    // }
  }
  protected async beforeStore(): Promise<void | NextResponse> {
    const email = this.data?.email;
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return this.sendError("Validation failed", { email: "Email already exists" }, 400);
      }
    }

    if (this.data?.name) {
      this.data.slug = await generateSlug("user", this.data.name);
      this.data.username = await generateSlug("user", this.data.name);
    }

    if (typeof this.data?.password === "string") {
      const bcrypt = await import("bcryptjs");
      this.data.password = await bcrypt.hash(this.data.password, 10);
    }

    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }
    if ((this.data as any)?.serviceCategories) {
      try {
        this._serviceCategoriesTemp = JSON.parse(
          (this.data as any).serviceCategories
        );
      } catch {
        throw new Error("Invalid serviceCategories JSON");
      }
  
      delete (this.data as any).serviceCategories;
    }
  }

  protected async afterStore(record: ExtendedEmployee): Promise<ExtendedEmployee> {
    const serviceCategories = this._serviceCategoriesTemp;
    
    if (!serviceCategories?.length) {
      await createUserToken(record.id, "web");
      return record;
    }
  
    const rows: any[] = [];
  
    for (const cat of serviceCategories) {
      for (const serviceId of cat.services) {
        rows.push({
          slug: `emp-services-${record.id}-${cat.categoryId}-${serviceId}`,
          userId: record.id,
          serviceCategoryId: Number(cat.categoryId),
          serviceId: Number(serviceId),
          serviceCategoryTitle: "",
          serviceTitle: null,
          servicePrice: "0",
        });
      }
    }
  
    await prisma.employeeServices.updateMany({
      where: { userId: record.id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  
    const serviceIds = rows.map(r => r.serviceId);
    const categoryIds = rows.map(r => r.serviceCategoryId);
  
    const [services, categories] = await Promise.all([
      prisma.services.findMany({ where: { id: { in: serviceIds } } }),
      prisma.serviceCategory.findMany({ where: { id: { in: categoryIds } } }),
    ]);
  
    const serviceMap = Object.fromEntries(services.map(s => [s.id, s]));
    const categoryMap = Object.fromEntries(categories.map(c => [c.id, c]));
  
    for (const row of rows) {
      row.serviceTitle = serviceMap[row.serviceId]?.title ?? null;
      row.serviceCategoryTitle = categoryMap[row.serviceCategoryId]?.title ?? "";
      row.servicePrice = String(serviceMap[row.serviceId]?.price ?? "0");
    }
  
    await prisma.employeeServices.createMany({ data: rows });

    await createUserToken(
      record.id,
      "web"
    );
    return record;
  }

  protected async beforeUpdate(): Promise<void | NextResponse> {
    const current_user = this.requireUser();
    const idParam = this.getRouteParam();
    const routeId = idParam ? parseInt(idParam.toString(), 10) : 0;

    if (parseInt(current_user.userGroupId, 10) == 3 && parseInt(current_user.id, 10) !== routeId) {
      return this.sendError("Validation failed", { authentication: "You can't update another employee's profile" }, 422);
    }
    
    const image = this.data?.image;
    if (image && !/\.(jpg|jpeg|png)$/i.test(image)) {
      return this.sendError("Invalid image format", { image: "Only JPG/PNG allowed" }, 400);
    }

    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }

    if ((this.data as any)?.serviceCategories) {
      try {
        this._serviceCategoriesTemp = JSON.parse(
          (this.data as any).serviceCategories
        );
      } catch {
        throw new Error("Invalid serviceCategories JSON");
      }
  
      delete (this.data as any).serviceCategories;
    }
  }

  protected async afterUpdate(record: ExtendedEmployee): Promise<ExtendedEmployee> {
    const serviceCategories = this._serviceCategoriesTemp;
    
    if (!serviceCategories?.length) {
      return record;
    }
    await prisma.employeeServices.deleteMany({ where: { userId: record.id } });
    
    const rows: any[] = [];
  
    for (const cat of serviceCategories) {
      for (const serviceId of cat.services) {
        rows.push({
          slug: `emp-services-${record.id}-${cat.categoryId}-${serviceId}`,
          userId: record.id,
          serviceCategoryId: Number(cat.categoryId),
          serviceId: Number(serviceId),
          serviceCategoryTitle: "",
          serviceTitle: null,
          servicePrice: "0",
        });
      }
    }
  
    await prisma.employeeServices.updateMany({
      where: { userId: record.id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  
    const serviceIds = rows.map(r => r.serviceId);
    const categoryIds = rows.map(r => r.serviceCategoryId);
  
    const [services, categories] = await Promise.all([
      prisma.services.findMany({ where: { id: { in: serviceIds } } }),
      prisma.serviceCategory.findMany({ where: { id: { in: categoryIds } } }),
    ]);
  
    const serviceMap = Object.fromEntries(services.map(s => [s.id, s]));
    const categoryMap = Object.fromEntries(categories.map(c => [c.id, c]));
  
    for (const row of rows) {
      row.serviceTitle = serviceMap[row.serviceId]?.title ?? null;
      row.serviceCategoryTitle = categoryMap[row.serviceCategoryId]?.title ?? "";
      row.servicePrice = String(serviceMap[row.serviceId]?.price ?? "0");
    }
  
    await prisma.employeeServices.createMany({ data: rows });

    return record;
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    
  }

  async login(email: string, password: string): Promise<NextResponse> {
    try {
      const user = await prisma.user.findUnique({ where: { email }, include: {userRole: true,apiTokens: true,}, });
      if (!user) {
        return this.sendError("Invalid credentials", {login_error: "Credentials are not match in our records."}, 400);
      }
      const bcrypt = await import("bcryptjs");
      const isValid = await bcrypt.compare(password, user.password || "");

      if (!isValid) {
        return this.sendError("Invalid credentials", {password_error: "Password does not match."}, 400);
      }

      await createUserToken(
        user.id,
        "web"
      );
      const loginuser = await prisma.user.findUnique({ where: { email }, include: {userRole: true,apiTokens: true,}, });
      const extendedEmployee = loginuser as ExtendedEmployee;

      return this.__sendResponse(200, "Login successful", extendedEmployee);
    } catch (err) {
      return this.sendError((err as Error).message, {}, 500);
    }
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<NextResponse> {
    try {
      // Get current user
      const currentUser = this.requireUser();
      const userId = parseInt(currentUser.id, 10);

      // Fetch user from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return this.sendError("User not found", {}, 404);
      }

      // Verify current password
      const bcrypt = await import("bcryptjs");
      const isValid = await bcrypt.compare(currentPassword, user.password || "");

      if (!isValid) {
        return this.sendError("Validation failed", {
          currentPassword: "Current password is incorrect",
        }, 422);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return this.__sendResponse(200, "Password changed successfully", {});
    } catch (err) {
      return this.sendError((err as Error).message, {}, 500);
    }
  }
}