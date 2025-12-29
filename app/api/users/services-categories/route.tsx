export const runtime = "nodejs";
import AdminServiceCategoryController from "@/controllers/AdminServiceCategoryController";
import type { ExtendedBlog } from "@/resources/AdminBlogResource";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { verifyToken } from "@/utils/jwt";
import { ExtendedAdminServiceCategory } from "@/resources/AdminServiceCategoryResources";

interface DecodedToken {
  id: string;
  [key: string]: unknown;
}

// ------------------- GET (list all service categories) -------------------
async function getUserFromRequest(req: Request): Promise<DecodedToken | null> {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return null;
    
    const token = authHeader.split(" ")[1]; // Bearer token
    const decoded = await verifyToken(token);

    if (!decoded || typeof decoded === "string") return null; // invalid token
    return decoded as DecodedToken;
  } catch (err) {
    return null; // catch any verify error
  }
}

export async function GET(req: Request) {
  const controller = new AdminServiceCategoryController(req);
  return controller.index();
}

