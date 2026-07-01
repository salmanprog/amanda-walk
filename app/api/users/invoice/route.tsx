export const runtime = "nodejs";
import UsersInvoiceController from "@/controllers/UsersInvoiceController";
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";
import { prisma } from "@/lib/prisma";

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
  const controller = new UsersInvoiceController(reqWithUser);
  return controller.index();
}
