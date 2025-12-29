export const runtime = "nodejs";
import AdminPetTypeController from "@/controllers/AdminPetTypeController";
import type { ExtendedPetType } from "@/resources/AdminPetTypeResource";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { verifyToken } from "@/utils/jwt";

interface DecodedToken {
  id: string;
  [key: string]: unknown;
}

export async function GET(req: Request) {
  const controller = new AdminPetTypeController(req);
  return controller.index();
}

