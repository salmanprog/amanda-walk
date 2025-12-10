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
// ------------------- POST (store) -------------------
export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  let data: Partial<ExtendedEmployeeService> = {};

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const folderName = 'employee';
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

    const controller = new AdminEmployeeServiceController(request, data);
    return await controller.store(data);
  } catch (error: unknown) {
    console.error("Error uploading employee image:", error);
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
async function getUserFromRequest(req: Request): Promise<DecodedToken | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const token = authHeader.split(" ")["1"];
  const decoded = await verifyToken(token);
  if (!decoded || typeof decoded === "string") return null;

  return decoded as DecodedToken;
}
export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  const controller = new AdminEmployeeServiceController(req, { id: Number(user?.id) });
  return controller.index();
}