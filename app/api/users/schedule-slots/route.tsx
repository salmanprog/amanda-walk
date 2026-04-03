export const runtime = "nodejs";
import UsersScheduleSlotsController from "@/controllers/UsersScheduleSlotsController";
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

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json(
      {
        code: 401,
        message: "Authorization failed",
        data: { authorization: "Missing or invalid token" },
      },
      { status: 401 }
    );
  }

  const controller = new UsersScheduleSlotsController(req);
  return controller.index();
}
