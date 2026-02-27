export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/jwt";

interface DecodedToken {
  id: string;
  [key: string]: unknown;
}

async function getCurrentUser(req: Request): Promise<DecodedToken | null> {
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

/** GET /api/admin/chat?bookingId=123 — list messages for a booking (one-to-one chat) */
export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json(
      { code: 401, message: "Authorization failed", data: { authorization: "Missing or invalid token" } },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const bookingIdParam = searchParams.get("bookingId");
  const bookingId = bookingIdParam ? Number(bookingIdParam) : NaN;
  if (!Number.isInteger(bookingId) || bookingId < 1) {
    return NextResponse.json(
      { code: 400, message: "Invalid or missing bookingId" },
      { status: 400 }
    );
  }

  try {
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, deletedAt: null },
      select: { id: true },
    });
    if (!booking) {
      return NextResponse.json(
        { code: 404, message: "Booking not found", data: null },
        { status: 404 }
      );
    }

    const messages = await prisma.bookingChatMessage.findMany({
      where: { bookingId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true, lname: true },
        },
        receiver: {
          select: { id: true, name: true, lname: true },
        },
      },
    });

    const currentUserId = Number(user.id);
    const data = {
      currentUserId,
      messages: messages.map((m) => ({
        id: m.id,
        bookingId: m.bookingId,
        senderId: m.senderId,
        receiverId: m.receiverId ?? null,
        sender: {
          id: m.sender.id,
          name: [m.sender.name, m.sender.lname].filter(Boolean).join(" ") || "—",
        },
        receiver: m.receiver
          ? { id: m.receiver.id, name: [m.receiver.name, m.receiver.lname].filter(Boolean).join(" ") || "—" }
          : null,
        message: m.message,
        createdAt: m.createdAt,
      })),
    };

    return NextResponse.json({ code: 200, message: "OK", data });
  } catch (err) {
    console.error("Chat GET error:", err);
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (err as Error).message },
      { status: 500 }
    );
  }
}

/** POST /api/admin/chat — send a message (body: { bookingId, message }) */
export async function POST(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json(
      { code: 401, message: "Authorization failed", data: { authorization: "Missing or invalid token" } },
      { status: 401 }
    );
  }

  let body: { bookingId?: number; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { code: 400, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const bookingId = body.bookingId != null ? Number(body.bookingId) : NaN;
  const messageText = typeof body.message === "string" ? body.message.trim() : "";
  if (!Number.isInteger(bookingId) || bookingId < 1) {
    return NextResponse.json(
      { code: 400, message: "Invalid or missing bookingId" },
      { status: 400 }
    );
  }
  if (!messageText) {
    return NextResponse.json(
      { code: 400, message: "Message is required" },
      { status: 400 }
    );
  }

  try {
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, deletedAt: null },
      select: { id: true, userId: true, assignedTo: true },
    });
    if (!booking) {
      return NextResponse.json(
        { code: 404, message: "Booking not found", data: null },
        { status: 404 }
      );
    }

    const senderId = Number(user.id);
    // Receiver: the other party in the booking (customer ↔ employee)
    const receiverId =
      senderId === booking.userId
        ? (booking.assignedTo ?? null) // customer sends → employee receives
        : booking.userId; // employee sends → customer receives
    const created = await prisma.bookingChatMessage.create({
      data: { bookingId, senderId, receiverId: receiverId != null && receiverId > 0 ? receiverId : null, message: messageText },
      include: {
        sender: {
          select: { id: true, name: true, lname: true },
        },
        receiver: {
          select: { id: true, name: true, lname: true },
        },
      },
    });

    const data = {
      id: created.id,
      bookingId: created.bookingId,
      senderId: created.senderId,
      receiverId: created.receiverId ?? null,
      sender: {
        id: created.sender.id,
        name: [created.sender.name, created.sender.lname].filter(Boolean).join(" ") || "—",
      },
      receiver: created.receiver
        ? { id: created.receiver.id, name: [created.receiver.name, created.receiver.lname].filter(Boolean).join(" ") || "—" }
        : null,
      message: created.message,
      createdAt: created.createdAt,
    };

    return NextResponse.json({ code: 200, message: "Message sent", data });
  } catch (err) {
    console.error("Chat POST error:", err);
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (err as Error).message },
      { status: 500 }
    );
  }
}
