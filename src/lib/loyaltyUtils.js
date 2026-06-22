export const DISCOUNT_BY_TIER = {
  Bronze: 5,
  Silver: 10,
  Gold: 15,
  Platinum: 20,
};

export const TIER_THRESHOLDS = [
  { tier: "Platinum", min: 1501 },
  { tier: "Gold", min: 501 },
  { tier: "Silver", min: 101 },
  { tier: "Bronze", min: 0 },
];

export function calculateDiscount(totalOriginal, tier) {
  const discountPercentage = DISCOUNT_BY_TIER[tier] || 0;
  const discountAmount = totalOriginal * (discountPercentage / 100);
  const totalFinal = totalOriginal - discountAmount;
  return { discountPercentage, totalFinal };
}

export function calculatePoints(totalFinal) {
  return Math.floor(totalFinal / 10000);
}

export function determineTier(totalPoints) {
  for (const threshold of TIER_THRESHOLDS) {
    if (totalPoints >= threshold.min) {
      return threshold.tier;
    }
  }
  return "Bronze";
}
