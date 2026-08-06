const STUDIO_TIERS = [
    { tier: 1, numeral: 'I', emoji: '\uD83C\uDFAC', name: 'Independent Studio', purchaseCost: 10000, dailyUpkeep: 500, staffSlots: 1 },
    { tier: 2, numeral: 'II', emoji: '\uD83C\uDFA5', name: 'Professional Studio', upgradeCost: 20000, dailyUpkeep: 750, staffSlots: 2 },
    { tier: 3, numeral: 'III', emoji: '\uD83C\uDFDB', name: 'Production House', upgradeCost: 40000, dailyUpkeep: 1000, staffSlots: 3 },
    { tier: 4, numeral: 'IV', emoji: '\uD83C\uDF1F', name: 'Movie Empire', upgradeCost: 75000, dailyUpkeep: 1250, staffSlots: 4 }
];

function getStudioTier(tier = 1) {
    return STUDIO_TIERS.find((entry) => entry.tier === Number(tier)) ?? STUDIO_TIERS[0];
}

function getNextStudioTier(tier = 1) {
    return STUDIO_TIERS.find((entry) => entry.tier === Number(tier) + 1) ?? null;
}

module.exports = { STUDIO_TIERS, getNextStudioTier, getStudioTier };
