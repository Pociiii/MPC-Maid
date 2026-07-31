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
