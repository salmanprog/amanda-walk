export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

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

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { code: 401, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    const userId = Number(user.id);
    if (!Number.isFinite(userId)) {
      return NextResponse.json(
        { code: 401, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    const body = await request.json();
    const invoiceId = Number(body?.invoiceId);

    if (!Number.isFinite(invoiceId) || invoiceId <= 0) {
      return NextResponse.json(
        { code: 422, message: "Invoice ID is required", data: null },
        { status: 422 }
      );
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId },
    });

    if (!invoice) {
      return NextResponse.json(
        { code: 404, message: "Invoice not found", data: null },
        { status: 404 }
      );
    }

    if (invoice.userPaid === 1) {
      return NextResponse.json(
        { code: 400, message: "Payment already submitted for this invoice", data: null },
        { status: 400 }
      );
    }

    const amount = Number(invoice.invoiceAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { code: 400, message: "Invoice amount is invalid", data: null },
        { status: 400 }
      );
    }

    const STRIPE_FEE_RATE = 0.03;
    const feeAmount = Math.round(amount * STRIPE_FEE_RATE * 100) / 100;
    const totalAmount = Math.round((amount + feeAmount) * 100) / 100;
    const amountInCents = Math.round(totalAmount * 100);

    if (amountInCents < 50) {
      return NextResponse.json(
        { code: 400, message: "Invoice amount is too low for Stripe", data: null },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      payment_method_types: ["card"],
      metadata: {
        invoiceId: String(invoice.id),
        userId: String(userId),
        baseAmount: String(amount),
        feeAmount: String(feeAmount),
        feeRate: "0.03",
      },
    });

    return NextResponse.json({
      code: 200,
      message: "Payment intent created",
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount,
        feeAmount,
        totalAmount,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create payment intent";
    return NextResponse.json(
      { code: 500, message, data: null },
      { status: 500 }
    );
  }
}
