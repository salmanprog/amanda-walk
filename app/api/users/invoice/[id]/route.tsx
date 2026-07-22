export const runtime = "nodejs";
import UsersInvoiceController from "@/controllers/UsersInvoiceController";
import type { ExtendedInvoice } from "@/resources/AdminInvoiceResource";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { verifyToken } from "@/utils/jwt";
import { prisma } from "@/lib/prisma";
import { isAllowedUploadFilename } from "@/lib/security/maliciousPathGuard";

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

async function buildRequestWithUser(req: Request, userId: number) {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, userGroupId: true, userType: true },
  });

  if (!dbUser) return null;

  const headers = new Headers(req.headers);
  headers.set(
    "x-current-user",
    JSON.stringify({
      id: String(dbUser.id),
      userGroupId: dbUser.userGroupId ?? null,
      userType: dbUser.userType,
    })
  );

  return new Request(req.url, { method: req.method, headers });
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

  const reqWithUser = await buildRequestWithUser(request, Number(user.id));
  if (!reqWithUser) {
    return NextResponse.json({ code: 401, message: "User not found" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") || "";
  let data: Partial<ExtendedInvoice> = {};

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      for (const [key, value] of formData.entries()) {
        if (typeof value === "string") {
          (data as Record<string, string>)[key] = value;
        } else if (value instanceof Blob && key === "image" && value.size > 0) {
          const file = value as File;
          const fileName = `${Date.now()}-${file.name || "upload.jpg"}`;
          if (!isAllowedUploadFilename(fileName)) {
            return NextResponse.json(
              { code: 400, message: "Invalid upload file type" },
              { status: 400 }
            );
          }
          const uploadDir = path.join(process.cwd(), "public", "uploads", "invoice");
          await fs.mkdir(uploadDir, { recursive: true });
          const buffer = Buffer.from(await file.arrayBuffer());
          const filePath = path.join(uploadDir, fileName);
          await fs.writeFile(filePath, buffer);
          (data as Record<string, string>).attachments = `/uploads/invoice/${fileName}`;
        }
      }
    } else {
      return NextResponse.json(
        { code: 415, message: "Unsupported Media Type. Use multipart/form-data." },
        { status: 415 }
      );
    }

    const controller = new UsersInvoiceController(reqWithUser, data);
    controller.setInvoiceId(invoiceId);
    return controller.update(invoiceId, data);
  } catch (error: unknown) {
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
