export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserByToken } from "@/utils/token";
import AdminBookingResource from "@/resources/AdminBookingResource";
import type { ExtendedBooking } from "@/resources/AdminBookingResource";

export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");
  let token = authHeader?.split(" ")[1];
  if (!token) {
    const cookieHeader = req.headers.get("Cookie") ?? "";
    const match = cookieHeader.match(/token=([^;]+)/);
    token = match?.[1]?.trim() ?? undefined;
  }

  if (!token) {
    return NextResponse.json(
      { code: 401, message: "Authorization failed", data: { authorization: "Missing or invalid token" } },
      { status: 401 }
    );
  }

  const user = await getUserByToken(token);
  if (!user?.id) {
    return NextResponse.json(
      { code: 401, message: "User not found", data: { authorization: "Invalid token" } },
      { status: 401 }
    );
  }

  const userId = Number(user.id);

  try {
    const records = await prisma.booking.findMany({
      where: {
        assignedTo: userId,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, lname: true } },
        category: { select: { title: true } },
        service: { select: { title: true } },
        schedules: {
          where: { deletedAt: null },
          select: { scheduleDate: true, scheduleTime: true, isStarted: true, isCompleted: true },
          orderBy: { scheduleDate: "asc" },
        },
      },
    });

    const resource = new AdminBookingResource();
    const data = await resource.collection(records as unknown as ExtendedBooking[]);

    return NextResponse.json({ code: 200, message: "Records fetched successfully", data }, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (err as Error).message },
      { status: 500 }
    );
  }
}
