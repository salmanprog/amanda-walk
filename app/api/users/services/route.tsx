export const runtime = "nodejs";
import AdminServiceController from "@/controllers/AdminServiceController";
import type { ExtendedAdminService } from "@/resources/AdminServiceResources";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { verifyToken } from "@/utils/jwt";

interface DecodedToken {
  id: string;
  [key: string]: unknown;
}

export async function GET(req: Request) {
  const controller = new AdminServiceController(req);
  return controller.index();
}

