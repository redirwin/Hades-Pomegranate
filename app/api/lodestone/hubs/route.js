import { initFirebaseAdminApp } from "@/lib/firebase/admin-config";

export async function GET() {
  try {
    console.log("Fetching resource hubs...");

    // Initialize Firebase Admin and get the admin instance
    const admin = initFirebaseAdminApp();
    const db = admin.firestore();

    const snapshot = await db.collection("resourceHubs").get();
    const hubs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log("Found hubs:", hubs);
    return Response.json(hubs);
  } catch (error) {
    console.error("Failed to fetch public hubs:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch hubs" }), {
      status: 500
    });
  }
}
