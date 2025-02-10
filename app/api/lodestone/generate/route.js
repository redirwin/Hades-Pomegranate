import { db } from "@/lib/firebase/admin-config";

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomPrice(basePrice, lowerMod, upperMod) {
  const minPrice = basePrice * (1 - lowerMod / 100);
  const maxPrice = basePrice * (1 + upperMod / 100);
  return Number((Math.random() * (maxPrice - minPrice) + minPrice).toFixed(2));
}

function selectRandomProvisions(provisions, targetCount) {
  const results = [];
  const totalWeight = provisions.reduce((sum, p) => sum + p.weight, 0);
  let currentScale = 1;
  const maxAttempts = 3; // Prevent infinite loops
  let attempts = 0;

  while (
    results.length < targetCount * 0.8 && // Keep trying until we hit 80% of target
    attempts < maxAttempts // Or hit max attempts
  ) {
    attempts++;

    // Calculate scaled weights for this pass
    const scaledProvisions = provisions.map((p) => ({
      ...p,
      weight: p.weight * currentScale
    }));

    const scaledTotalWeight = totalWeight * currentScale;

    // Try to fill remaining slots
    const remainingSlots = targetCount - results.length;

    for (let i = 0; i < remainingSlots; i++) {
      const random = Math.random() * scaledTotalWeight;
      let currentWeight = 0;
      let selected = false;

      for (const provision of scaledProvisions) {
        currentWeight += provision.weight;
        if (random <= currentWeight) {
          // Additional random check based on scaled rarity
          const rarityCheck = Math.random() * 100;
          // More rare items need a lower random number to be selected
          if (rarityCheck <= (provision.weight / scaledTotalWeight) * 100) {
            results.push(provision);
            selected = true;
          }
          break;
        }
      }

      // If nothing was selected this round, continue to next slot
      if (!selected) {
        continue;
      }
    }

    // Increase scale for next pass if we're still under target
    if (results.length < targetCount * 0.8) {
      currentScale *= 1.5; // Increase weights by 50% each pass
    }
  }

  return results;
}

export async function POST(request) {
  try {
    const { hubId } = await request.json();

    // Get the resource hub
    const hubDoc = await db.collection("resourceHubs").doc(hubId).get();
    if (!hubDoc.exists) {
      throw new Error("Resource hub not found");
    }

    const hub = { id: hubDoc.id, ...hubDoc.data() };

    // Get the rarity settings
    const rarityDoc = await db.collection("settings").doc("rarity").get();
    const rarityWeights = rarityDoc.exists
      ? rarityDoc.data().options.reduce((acc, option) => {
          acc[option.value] = option.weight === "random" ? 50 : option.weight;
          return acc;
        }, {})
      : {
          // Fallback weights if settings don't exist
          Junk: 100,
          Common: 80,
          Uncommon: 60,
          Rare: 40,
          "Very Rare": 20,
          Legendary: 10,
          Artifact: 5,
          Wondrous: 2,
          Varies: 50
        };

    // Get all provisions for this hub
    const provisionDocs = await Promise.all(
      hub.selectedProvisions.map((id) =>
        db.collection("provisions").doc(id).get()
      )
    );

    // Prepare provisions with their weights
    const provisions = provisionDocs
      .filter((doc) => doc.exists)
      .map((doc) => {
        const data = doc.data();
        const weight = rarityWeights[data.rarity] || 50; // Use dynamic weights

        return {
          id: doc.id,
          ...data,
          weight
        };
      });

    // Generate random number of total provisions
    const totalProvisions = getRandomInt(hub.minProvisions, hub.maxProvisions);

    // Select random provisions based on weights
    const selectedProvisions = selectRandomProvisions(
      provisions,
      totalProvisions
    );

    // Generate prices and count occurrences
    const results = selectedProvisions.reduce((acc, provision) => {
      const key = provision.id; // Only use the provision ID as key

      if (!acc[key]) {
        // Generate price once per unique item
        const price = getRandomPrice(
          provision.basePrice,
          hub.lowerPriceModifier || 0,
          hub.upperPriceModifier || 0
        );

        acc[key] = {
          id: provision.id,
          name: provision.name,
          price, // Same price will be used for all instances of this item
          count: 0,
          rarity: provision.rarity
        };
      }

      acc[key].count++;
      return acc;
    }, {});

    return Response.json({
      hubName: hub.name,
      items: Object.values(results)
    });
  } catch (error) {
    console.error("Error generating list:", error);
    return Response.json(
      { error: "Failed to generate list", details: error.message },
      { status: 500 }
    );
  }
}
