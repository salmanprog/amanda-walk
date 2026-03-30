import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/jwt";

export const runtime = "nodejs";

async function getUserIdFromRequest(req: Request): Promise<number | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  if (!token) return null;
  const decoded = await verifyToken(token);
  if (!decoded || typeof decoded === "string") return null;
  const id = Number((decoded as { id?: string | number }).id);
  return Number.isFinite(id) ? id : null;
}

export async function GET(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json(
      { code: 401, message: "Unauthorized", data: null },
      { status: 401 }
    );
  }

  const [totalClients, totalEmployees, totalBookings, totalServices] =
    await Promise.all([
      prisma.user.count({
        where: { userGroupId: 3, deletedAt: null },
      }),
      prisma.user.count({
        where: { userGroupId: 2, deletedAt: null },
      }),
      prisma.booking.count({
        where: { deletedAt: null },
      }),
      prisma.employeeServices.count({
        where: { deletedAt: null },
      }),
    ]);

  return NextResponse.json({
    code: 200,
    message: "ok",
    data: {
      totalClients,
      totalEmployees,
      totalBookings,
      totalServices,
    },
  });
}
