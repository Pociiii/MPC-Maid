const {
    createEmbed
} = require('../../utils/embeds');

const {
    CHANNELS,
    COOLDOWNS,
    ECONOMY,
    getRandomColor
} = require('../../data/constants');

const {
    getStudioNpc
} = require('../../data/studioNpcs');

const {
    STUDIO_TIERS
} = require('../../data/studioTiers');

function minutes(
    seconds
) {

    return `${Math.floor(
        seconds / 60
    )} min`;

}

module.exports = {

    async execute(
        interaction
    ) {

        const personalAgent =
            getStudioNpc(
                'personal_agent'
            );

        const cleaner = getStudioNpc('cleaner');
        const castingDirector = getStudioNpc('casting_director');
        const productionManager = getStudioNpc('production_manager');
        const talentScout = getStudioNpc('talent_scout');
        const marketingExpert = getStudioNpc('marketing_expert');

        const embed =
            createEmbed({
                color:
                    getRandomColor(),
                title:
                    'Porn Career Minigame',
                description:
`Quick guide for scenes, stats, boosters, and rewards.

**Requests**
- Use \`/pornscene partner:@user\`.
- The partner gets a DM with Accept / Decline.
- Request cooldown: **${minutes(COOLDOWNS.PORN_SCENE_REQUEST)}**.
- You pick no booster, or one booster from \`/inventory boosters\`.
- The booster is reserved when the request is sent and returned if the request does not start a scene.
- If they decline, nothing posts publicly.

**Scenes**
- Accepted scenes run in <#${CHANNELS.PORN_CAREER}>.
- Final results and scene links post in <#${CHANNELS.MOMENTS}>.
- Scenes post in parts over about 1 hour.
- Custom scenes use \`/customscene\` and cost **${ECONOMY.CUSTOM_SCENE_PART_COST} coins per selected part**.

**Player Studios**
- Use \`/mystudio\` to view, buy, or reopen your studio.
- Studio tiers: ${STUDIO_TIERS.map((tier) => `**${tier.numeral}** ${tier.name} (${tier.tier === 1 ? `${tier.purchaseCost} purchase` : `${tier.upgradeCost} upgrade`}, ${tier.dailyUpkeep}/day, ${tier.staffSlots} staff slot${tier.staffSlots === 1 ? '' : 's'})`).join('; ')}.
- Use \`/studios\` to browse open studios and their production threads.
- Productions started while your studio is open are mirrored into its thread.
- Studio Overview shows the owner's total gameplay coin income from the previous 12:00 UTC economy day.
- Use **Close Studio** in \`/mystudio\` to pause studio and staff upkeep. Existing productions still finish, and reopening costs **${ECONOMY.STUDIO_REOPEN_COST} coins**.
- Use **Manage Staff** in \`/mystudio\` to hire, reactivate, or fire NPC staff. Firing gives no refund.
- The **Personal Agent** costs **${personalAgent.hireCost} coins**, with **${personalAgent.dailyUpkeep} coins** daily upkeep.
- An active Personal Agent lets its owner send normal \`/pornscene\` requests while already filming. Consent and the one-scene limit are unchanged; Accept only works when both members are free.
- The **Cleaner** costs **${cleaner.hireCost} coins**, with **${cleaner.dailyUpkeep} coins** daily upkeep, and reduces base studio upkeep by **25%**.
- The **Casting Director** costs **${castingDirector.hireCost} coins**, with **${castingDirector.dailyUpkeep} coins** daily upkeep. Requests sent while active do not expire and can be cancelled through **Pending Requests**.
- The **Production Manager** costs **${productionManager.hireCost} coins**, with **${productionManager.dailyUpkeep} coins** daily upkeep, and makes requested scenes **10% faster**.
- The **Talent Scout** costs **${talentScout.hireCost} coins**, with **${talentScout.dailyUpkeep} coins** daily upkeep, rolls requested scenes twice, and keeps the better complete result.
- The **Marketing Expert** costs **${marketingExpert.hireCost} coins**, with **${marketingExpert.dailyUpkeep} coins** daily upkeep, and gives the requester **10% more scene coins**.
- Unpaid staff upkeep suspends that NPC without closing the studio. Reactivation costs one day of that NPC's upkeep.

**Stats**
- **Performance**: better result and higher critical chance.
- **Stamina**: more scene parts and bonus XP.
- **Fame**: more viewers and coins.
- Both partners' stats are added together.
- Boosters add stats for one scene only.

**Progression**
- Scene XP: Awkward **10**, Solid **20**, Hot **35**, Viral **55**.
- Critical scenes add **+10 XP**.
- More Stamina can add extra XP.
- The requester gets **+${ECONOMY.PORN_SCENE_STARTER_XP_BONUS} XP** for starting.
- Use \`/train\` to upgrade stats.
- Use \`/shop boosters\` to buy boosters and \`/inventory boosters\` to see them.`,
                footerText:
                    'MPC Maid Command Guide - Porn Career Info',
                timestamp:
                    true
            });

        await interaction.reply({
            embeds: [embed],
            flags: 64
        });

    }

};
