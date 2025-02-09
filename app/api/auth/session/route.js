import { cookies } from "next/headers";
import { initFirebaseAdminApp } from "@/app/firebase/admin-config";
import admin from "firebase-admin";

export async function POST(request) {
  try {
    const { idToken } = await request.json();

    // Initialize Firebase Admin if not already initialized
    initFirebaseAdminApp();

    // Verify the ID token
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await admin
      .auth()
      .createSessionCookie(idToken, { expiresIn });

    // Get cookie store and await it
    const cookieStore = await cookies();

    // Set the cookie
    cookieStore.set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/"
    });

    return new Response(JSON.stringify({ status: "success" }), {
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401
    });
  }
}
