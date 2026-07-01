export const runtime = "nodejs";
import AdminInvoiceController from "@/controllers/AdminInvoiceController";
import type { ExtendedInvoice } from "@/resources/AdminInvoiceResource";
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";

interface DecodedToken {
  id: string;
  [key: string]: unknown;
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
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

  const contentType = request.headers.get("content-type") || "";
  let data: Partial<ExtendedInvoice & { invoiceAmount?: number }> = {};

  try {
    if (contentType.includes("application/json")) {
      data = await request.json();
    } else {
      return NextResponse.json(
        { code: 415, message: "Unsupported Media Type. Use application/json." },
        { status: 415 }
      );
    }

    const headers = new Headers(request.headers);
    headers.set("x-current-user", JSON.stringify({ id: String(user.id) }));
    const reqCtx = new Request(request.url, { method: request.method, headers });
    const controller = new AdminInvoiceController(reqCtx, data);
    return await controller.store(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
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

  const controller = new AdminInvoiceController(req);
  return controller.index();
}
