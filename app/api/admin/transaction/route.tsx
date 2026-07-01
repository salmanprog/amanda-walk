import AdminTransactionController from "@/controllers/AdminTransactionController";
import { verifyToken } from "@/utils/jwt";

export const runtime = "nodejs";

interface DecodedToken {
  id: string;
  [key: string]: unknown;
}

async function getUserFromRequest(req: Request): Promise<DecodedToken | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  const decoded = await verifyToken(token);
  if (!decoded || typeof decoded === "string") return null;

  return decoded as DecodedToken;
}

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return new Response(
      JSON.stringify({
        code: 401,
        message: "Authorization failed",
        data: { authorization: "Missing or invalid token" },
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const controller = new AdminTransactionController(req);
  return controller.index();
}
