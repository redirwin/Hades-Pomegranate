import { cookies } from "next/headers";
import { initFirebaseAdminApp } from "@/lib/firebase/admin-config";

export async function POST(request) {
  try {
    const { idToken } = await request.json();

    // Initialize Firebase Admin and get the admin instance
    const admin = initFirebaseAdminApp();

    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await admin
      .auth()
      .createSessionCookie(idToken, { expiresIn });

    // Await the cookies() call
    const cookieStore = await cookies();

    cookieStore.set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax"
    });

    return new Response(JSON.stringify({ status: "success" }), {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    console.error("Failed to create session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401
    });
  }
}
