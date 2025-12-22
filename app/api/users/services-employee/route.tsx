import AdminEmployeeServiceController, { ExtendedEmployeeService } from "@/controllers/AdminEmployeeServiceController";
import { verifyToken } from "@/utils/jwt";
import path from "path";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import AdminServiceController from "@/controllers/AdminServiceController";
export const runtime = "nodejs";
type FormDataObject = Record<string, string | Blob>;
interface DecodedToken {
  id: string;
  [key: string]: unknown;
}
// ------------------- GET (list all service employee) -------------------
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
  const controller = new AdminEmployeeServiceController(req, { id: Number(user?.id) });
  return controller.index();
}