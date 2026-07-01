export const runtime = "nodejs";
import AdminInvoiceController from "@/controllers/AdminInvoiceController";
import type { ExtendedInvoice } from "@/resources/AdminInvoiceResource";
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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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

  const params = await context.params;
  const invoiceId = Number(params.id);
  if (!invoiceId || Number.isNaN(invoiceId)) {
    return NextResponse.json(
      { code: 400, message: "Invalid invoice id" },
      { status: 400 }
    );
  }

  const contentType = request.headers.get("content-type") || "";
  let data: Partial<Pick<ExtendedInvoice, "isPaid">> = {};

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
    return controller.update(invoiceId, data);
  } catch (error: unknown) {
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
