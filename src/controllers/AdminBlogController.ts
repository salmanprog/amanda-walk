import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";
import AdminBlogHook from "@/hooks/AdminBlogHook";
import AdminBlogResource from "@/resources/AdminBlogResource";
import { storeBlog, updateBlog } from "@/validators/user.validation";
import { generateSlug } from "@/utils/slug";
import type { ExtendedBlog } from "@/resources/AdminBlogResource";

export default class AdminBlogController extends RestController<
  any,
  ExtendedBlog
> {
  constructor(req?: Request, data?: Partial<ExtendedBlog>) {
    super(
      (prisma as any).blog as any,
      req
    );

    this.data = data ?? {};
    this.resource = AdminBlogResource;
    this.hook = AdminBlogHook;
  }

  // ------------------- Validation -------------------
  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storeBlog, this.data ?? {});
      case "update":
        return await this.__validate(updateBlog, this.data ?? {});
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
      this.data.slug = await generateSlug("blog" as any, this.data.title);
    }
    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }
  }

  protected async afterStore(record: ExtendedBlog): Promise<ExtendedBlog> {
    return record;
  }

  protected async beforeUpdate(): Promise<void | NextResponse> {
    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }
  }

  protected async afterUpdate(record: ExtendedBlog): Promise<ExtendedBlog> {
    return record;
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    const currentUser = this.requireUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
  }
}

