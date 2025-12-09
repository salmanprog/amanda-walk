export const runtime = "nodejs";
import AdminBlogController from "@/controllers/AdminBlogController";
import { NextResponse } from "next/server";

// ------------------- GET (show) -------------------
export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params;
  try {
    const controller = new AdminBlogController(_req);
    const slug = params.slug;
    return await controller.showSlug(String(slug));
  } catch (error: unknown) {
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

