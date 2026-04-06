export const runtime = "nodejs";
import AdminGenerateSignupLinkController from "@/controllers/AdminGenerateSignupLinkController";
import type { ExtendedGenerateSignupLink } from "@/resources/AdminGenerateSignupLinkResource";
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

function requestWithUser(req: Request, user: DecodedToken): Request {
  const headers = new Headers();
  headers.set("x-current-user", JSON.stringify({ id: String(user.id) }));
  return new Request(req.url, { headers });
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params;
  try {
    const controller = new AdminGenerateSignupLinkController(_req);
    return await controller.showSlug(String(params.slug));
  } catch (error: unknown) {
    return NextResponse.json(
      {
        code: 500,
        message: "Internal Server Error",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> }
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
  const slug = params.slug;

  const contentType = request.headers.get("content-type") || "";
  let data: Partial<ExtendedGenerateSignupLink> = {};

  try {
    if (contentType.includes("application/json")) {
      data = await request.json();
    } else {
      return NextResponse.json(
        { code: 415, message: "Unsupported Media Type. Use application/json." },
        { status: 415 }
      );
    }

    const controller = new AdminGenerateSignupLinkController(
      requestWithUser(request, user),
      data
    );
    return controller.updateBySlug(slug, data);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        code: 500,
        message: "Internal Server Error",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
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

  const params = await context.params;
  try {
    const controller = new AdminGenerateSignupLinkController(
      requestWithUser(req, user)
    );
    return await controller.destroyBySlug(params.slug);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        code: 500,
        message: "Internal Server Error",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
