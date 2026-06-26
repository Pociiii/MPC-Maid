const {
    createEmbed
} = require('../../utils/embeds');

const {
    CHANNELS,
    COOLDOWNS,
    ECONOMY,
    getRandomColor
} = require('../../data/constants');

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

        const embed =
            createEmbed({
                color:
                    getRandomColor(),
                title:
                    'Porn Career Minigame',
                description:
`The porn career system lets users build a pornstar character through shared scenes, XP, coins, fame, and ranking.

**Requests**
- Use \`/pornscene partner:@user\` to send a DM request.
- Request cooldown: **${minutes(COOLDOWNS.PORN_SCENE_REQUEST)}**.
- Before the DM is sent, the requester chooses no booster or spends one owned booster from \`/inventory\`.
- A booster is consumed when the request is sent. It is not refunded if the partner declines.
- Requests can wait. Busy is checked only when the partner presses Accept.
- You can only have one pending request with the same target while the bot is running.

**Scenes**
- Accepted scenes post in <#${CHANNELS.PORN_CAREER}>.
- Moments and final scene links post in <#${CHANNELS.MOMENTS}>.
- Parts are posted over time, one every 8-12 minutes.
- The scene lasts up to about 1 hour.
- Custom scenes post in <#${CHANNELS.CUSTOM_SCENE}> over 30 minutes and cost **${ECONOMY.CUSTOM_SCENE_PART_COST} coins per selected part**.

**Stats**
- Performance improves scene score and critical scene chance.
- Stamina increases total scene parts.
- Fame increases viewers and revenue.
- Ranking changes based on the final scene outcome.
- Partner stats are combined for the scene.
- Every stat adds the same scene score bonus every **10 combined points**.
- Performance gets more critical chance every **10 combined points**, capped at **15%**.
- Stamina adds scene parts every **10 combined points**, up to **8 parts**.
- Fame gets a bigger viewer/revenue bonus every **10 combined points**.
- A critical scene upgrades the outcome by one tier and adds a small XP bonus.
- Boosters count for that scene's combined stat check only.
- Stats keep counting after **40**, but training costs get much steeper.
- Scene stat achievements unlock at combined stat thresholds like **10**, **20**, **30**, and beyond.

**Progression**
- Completed scenes grant XP based on outcome, plus coins, ranking points, and scenes completed.
- Scene XP: Awkward **10**, Solid **20**, Hot **35**, Viral **55**. Critical scenes add **+10 XP**. The requester gets **+${ECONOMY.PORN_SCENE_STARTER_XP_BONUS} XP** for starting the scene.
- Use \`/train\` to spend XP and coins on Performance, Stamina, and Fame.
- Boosters are one-use scene bonuses for the requester only.
- Booster tiers: T1 **120**, T2 **350**, T3 **800**, T4 **1400** coins.
- Boosters are best used when they push a combined stat over a **10 / 20 / 30** threshold.
- Stronger boosters add more stat power and more burnout/flop risk.
- Use \`/shop\` to buy boosters and \`/inventory\` to check owned boosters.`,
                footerText:
                    '/commands - Porn Career Info',
                timestamp:
                    true
            });

        await interaction.reply({
            embeds: [embed],
            flags: 64
        });

    }

};
