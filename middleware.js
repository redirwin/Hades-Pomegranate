import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/lodestone"];

export async function middleware(request) {
  const session = request.cookies.get("session");

  if (!session && !PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/lodestone", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/lodestone/admin/:path*"]
};
