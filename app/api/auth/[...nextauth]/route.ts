import { GET as AuthGET, POST as AuthPOST } from "app/auth";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  _context: { params: Promise<{ nextauth: string[] }> }
) {
  return AuthGET(request);
}

export async function POST(
  request: NextRequest,
  _context: { params: Promise<{ nextauth: string[] }> }
) {
  return AuthPOST(request);
}
