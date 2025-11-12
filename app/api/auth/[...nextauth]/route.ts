import { handlers } from 'app/auth'
import type { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  _context: { params: Promise<{ nextauth: string[] }> },
) {
  return handlers.GET(request)
}

export async function POST(
  request: NextRequest,
  _context: { params: Promise<{ nextauth: string[] }> },
) {
  return handlers.POST(request)
}
