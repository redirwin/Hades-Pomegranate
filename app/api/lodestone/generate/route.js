import { getFirestore } from "@/lib/firebase/admin-config";

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

  // Create weighted ranges for selection
  const ranges = [];
  let currentTotal = 0;
  provisions.forEach((p) => {
    const start = currentTotal;
    currentTotal += p.weight;
    ranges.push({
      provision: p,
      start,
      end: currentTotal
    });
  });

  for (let i = 0; i < targetCount; i++) {
    const roll = Math.random() * totalWeight;
    const selected = ranges.find((r) => roll >= r.start && roll < r.end);
    if (selected) {
      results.push(selected.provision);
    }
  }

  return results;
}

export async function POST(request) {
  try {
    const { hubId, testMode } = await request.json();
    const db = getFirestore();

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
          // Ensure weight is always a number
          const weight =
            option.weight === "random"
              ? 50
              : typeof option.weight === "string"
              ? parseInt(option.weight, 10)
              : Number(option.weight);

          acc[option.value] = weight;
          return acc;
        }, {})
      : {
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
        const weight = rarityWeights[data.rarity] || 50;
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
      const key = provision.id;

      if (!acc[key]) {
        const price = getRandomPrice(
          provision.basePrice,
          hub.lowerPriceModifier || 0,
          hub.upperPriceModifier || 0
        );

        acc[key] = {
          id: provision.id,
          name: provision.name,
          price,
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
    return Response.json(
      { error: "Failed to generate list", details: error.message },
      { status: 500 }
    );
  }
}
