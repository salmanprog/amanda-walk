export const runtime = "nodejs";
import AdminBookingController from "@/controllers/AdminBookingController";
import type { ExtendedBooking } from "@/resources/AdminBookingResource";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { verifyToken } from "@/utils/jwt";
import { prisma } from "@/lib/prisma";

interface DecodedToken {
  id: string;
  [key: string]: unknown;
}

// ------------------- POST (store) -------------------
export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  let data: Partial<ExtendedBooking> = {};

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const folderName = 'pet';
      const uploadDir = path.join(process.cwd(), "public", "uploads", folderName);
      await fs.mkdir(uploadDir, { recursive: true });

      for (const [key, value] of formData.entries()) {
        if (typeof value === "string") {
          (data as Record<string, any>)[key] = value;
        } else if (value instanceof Blob && key === "image") {
          const file = value as File;
                    
          const buffer = Buffer.from(await file.arrayBuffer());
          const fileName = `${Date.now()}-${file.name || "upload"}`;
          const filePath = path.join(uploadDir, fileName);
          await fs.writeFile(filePath, buffer);
          (data as Record<string, any>).imageUrl = `/uploads/${folderName}/${fileName}`;
        }
      }
    } else if (contentType.includes("application/json")) {
      data = await request.json();
    } else {
      return NextResponse.json(
        { code: 415, message: "Unsupported Media Type" },
        { status: 415 }
      );
    }

    const controller = new AdminBookingController(request, data);
    return await controller.store(data);
  } catch (error: unknown) {
    console.error("Error uploading pet image:", error);
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

  // ------------------- GET (list all pets) -------------------
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

  const uid = Number(user.id);
  const dbUser = await prisma.user.findUnique({
    where: { id: uid },
    select: { id: true, userGroupId: true, userType: true },
  });
  if (!dbUser) {
    return NextResponse.json(
      { code: 401, message: "User not found" },
      { status: 401 }
    );
  }

  const headers = new Headers(req.headers);
  headers.set(
    "x-current-user",
    JSON.stringify({
      id: String(dbUser.id),
      userGroupId: dbUser.userGroupId ?? null,
      userType: dbUser.userType,
    })
  );
  const reqWithUser = new Request(req.url, { method: req.method, headers });
  const controller = new AdminBookingController(reqWithUser);
  return controller.index();
}

