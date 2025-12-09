export const runtime = "nodejs";
import AdminBlogController from "@/controllers/AdminBlogController";

export async function GET(req: Request) {
  const controller = new AdminBlogController(req);
  return controller.index();
}

