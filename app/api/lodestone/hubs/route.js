import { db } from "@/lib/firebase/admin-config";

export async function GET() {
  try {
    console.log("Fetching resource hubs...");
    const snapshot = await db.collection("resourceHubs").get();
    const hubs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log("Found hubs:", hubs);
    return Response.json(hubs);
  } catch (error) {
    console.error("Error fetching resource hubs:", error);
    // Return more detailed error information during development
    return Response.json(
      {
        error: "Failed to fetch resource hubs",
        details: error.message
      },
      { status: 500 }
    );
  }
}
