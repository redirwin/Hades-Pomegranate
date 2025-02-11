import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/lodestone"];

export async function middleware(request) {
  const session = request.cookies.get("session");

  console.log("Middleware check:", {
    path: request.nextUrl.pathname,
    hasSession: !!session,
    sessionValue: session?.value?.substring(0, 20) + "..." // Log first 20 chars for debugging
  });

  if (!session && !PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
    console.log("No session found, redirecting to /lodestone");
    return NextResponse.redirect(new URL("/lodestone", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/lodestone/admin/:path*"]
};
