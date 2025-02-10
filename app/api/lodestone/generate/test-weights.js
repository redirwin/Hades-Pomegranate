function testWeightDistribution(provisions, iterations = 10000) {
  const results = {
    totalRolls: iterations,
    byRarity: {},
    byName: {}
  };

  // Run many iterations
  for (let i = 0; i < iterations; i++) {
    const totalWeight = provisions.reduce((sum, p) => sum + p.weight, 0);
    const roll = Math.random() * totalWeight;

    let currentWeight = 0;
    for (const provision of provisions) {
      currentWeight += provision.weight;
      if (roll <= currentWeight) {
        // Track by rarity
        results.byRarity[provision.rarity] =
          (results.byRarity[provision.rarity] || 0) + 1;
        // Track by individual item
        results.byName[provision.name] =
          (results.byName[provision.name] || 0) + 1;
        break;
      }
    }
  }

  // Calculate expected vs actual percentages
  const totalWeight = provisions.reduce((sum, p) => sum + p.weight, 0);

  console.log("\n=== Weight Distribution Test Results ===");
  console.log(`Total iterations: ${iterations}`);

  console.log("\nBy Rarity:");
  Object.entries(results.byRarity).forEach(([rarity, count]) => {
    const actualPercentage = (count / iterations) * 100;
    const rarityWeight = provisions
      .filter((p) => p.rarity === rarity)
      .reduce((sum, p) => sum + p.weight, 0);
    const expectedPercentage = (rarityWeight / totalWeight) * 100;
    const variance = actualPercentage - expectedPercentage;

    console.log(`${rarity}:`);
    console.log(`  Expected: ${expectedPercentage.toFixed(2)}%`);
    console.log(`  Actual:   ${actualPercentage.toFixed(2)}%`);
    console.log(`  Variance: ${variance.toFixed(2)}%`);
  });

  console.log("\nBy Item:");
  Object.entries(results.byName).forEach(([name, count]) => {
    const actualPercentage = (count / iterations) * 100;
    const item = provisions.find((p) => p.name === name);
    const expectedPercentage = (item.weight / totalWeight) * 100;
    const variance = actualPercentage - expectedPercentage;

    console.log(`${name} (${item.rarity}):`);
    console.log(`  Expected: ${expectedPercentage.toFixed(2)}%`);
    console.log(`  Actual:   ${actualPercentage.toFixed(2)}%`);
    console.log(`  Variance: ${variance.toFixed(2)}%`);
  });

  return results;
}
