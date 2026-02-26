export const runtime = "nodejs";
import AdminBookingController from "@/controllers/AdminBookingController";
import type { ExtendedBooking } from "@/resources/AdminBookingResource";
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";

interface DecodedToken {
  id: string;
  [key: string]: unknown;
}

async function getUserFromRequest(req: Request): Promise<DecodedToken | null> {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return null;
    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);
    if (!decoded || typeof decoded === "string") return null;
    return decoded as DecodedToken;
  } catch {
    return null;
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { code: 401, message: "Authorization failed", data: { authorization: "Missing or invalid token" } },
      { status: 401 }
    );
  }
  const { id } = await context.params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) {
    return NextResponse.json(
      { code: 400, message: "Invalid booking ID" },
      { status: 400 }
    );
  }
  try {
    const controller = new AdminBookingController(req);
    return await controller.show(numericId);
  } catch (error: unknown) {
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { code: 401, message: "Authorization failed", data: { authorization: "Missing or invalid token" } },
      { status: 401 }
    );
  }
  const { id } = await context.params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) {
    return NextResponse.json(
      { code: 400, message: "Invalid booking ID" },
      { status: 400 }
    );
  }
  let data: Partial<ExtendedBooking> = {};
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await request.json();
    } else {
      return NextResponse.json(
        { code: 415, message: "Unsupported Media Type" },
        { status: 415 }
      );
    }
    const controller = new AdminBookingController(request, data);
    return await controller.update(numericId, data);
  } catch (error: unknown) {
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
