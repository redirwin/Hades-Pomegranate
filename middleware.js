import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/"];

export async function middleware(request) {
  const session = request.cookies.get("session");

  if (!session && !PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
