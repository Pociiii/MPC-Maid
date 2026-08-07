const STUDIO_NPCS = [
    {
        key:
            'personal_agent',
        name:
            'Personal Agent',
        emoji:
            '\uD83D\uDCBC',
        hireCost:
            5000,
        dailyUpkeep:
            750,
        description:
            'Allows you to send normal /pornscene requests while already filming. Requests still require consent and can only be accepted when both participants are free.'
    },
    {
        key:
            'cleaner',
        name:
            'Cleaner',
        emoji:
            '\uD83E\uDDF9',
        hireCost:
            2500,
        dailyUpkeep:
            250,
        description:
            'Reduces base Studio upkeep by 25%. Does not reduce staff upkeep or affect /pornscene cooldowns.'
    },
    {
        key:
            'casting_director',
        name:
            'Casting Director',
        emoji:
            '\uD83C\uDFAD',
        hireCost:
            3500,
        dailyUpkeep:
            400,
        description:
            'Scene requests you send no longer expire after 24 hours. They remain pending until accepted, declined, or manually cancelled.'
    },
    {
        key:
            'production_manager',
        name:
            'Production Manager',
        emoji:
            '\uD83C\uDFA5',
        hireCost:
            4000,
        dailyUpkeep:
            500,
        description:
            'Reduces the duration of Porn Career scenes you request by 10%.'
    },
    {
        key:
            'talent_scout',
        name:
            'Talent Scout',
        emoji:
            '\uD83C\uDFAF',
        hireCost:
            6000,
        dailyUpkeep:
            800,
        description:
            'Rolls your requested scene result twice and automatically keeps the better complete result.'
    },
    {
        key:
            'marketing_expert',
        name:
            'Marketing Expert',
        emoji:
            '\uD83D\uDCE2',
        hireCost:
            4500,
        dailyUpkeep:
            600,
        description:
            'Increases your coin reward from requested Porn Career scenes by 10%. Your partner receives the normal reward.'
    }
];

function getStudioNpc(
    key
) {

    return STUDIO_NPCS.find(
        (npc) =>
            npc.key === key
    ) ?? null;

}

module.exports = {
    STUDIO_NPCS,
    getStudioNpc
};
