export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserByToken } from "@/utils/token";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get("Authorization");
  let token = authHeader?.split(" ")[1];
  if (!token) {
    const cookieHeader = request.headers.get("Cookie") ?? "";
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

  const { id } = await context.params;
  const scheduleId = Number(id);
  if (!Number.isInteger(scheduleId) || scheduleId < 1) {
    return NextResponse.json(
      { code: 400, message: "Invalid schedule ID" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const data: { isStarted?: boolean; isCompleted?: boolean } = {};
    if ("isStarted" in body && typeof body.isStarted === "boolean") {
      data.isStarted = body.isStarted;
    }
    if ("isCompleted" in body && typeof body.isCompleted === "boolean") {
      data.isCompleted = body.isCompleted;
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { code: 400, message: "No valid fields to update (isStarted or isCompleted required)" },
        { status: 400 }
      );
    }

    const updated = await prisma.bookingSchedule.update({
      where: { id: scheduleId },
      data,
    });

    return NextResponse.json(
      { code: 200, message: "Schedule updated successfully", data: updated },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
