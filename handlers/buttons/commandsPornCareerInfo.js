const {
    createEmbed
} = require('../../utils/embeds');

const {
    CHANNELS,
    COOLDOWNS,
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
- Rumors and final scene links post in <#${CHANNELS.RUMORS}>.
- Parts are posted over time, one every 8-12 minutes.
- The scene lasts up to about 1 hour.
- Custom scenes post in <#${CHANNELS.CUSTOM_SCENE}> over 30 minutes.

**Stats**
- Performance increases XP output.
- Stamina increases total scene parts.
- Fame increases viewers and revenue.
- Ranking changes based on the final scene outcome.
- Partner stats are combined for the scene.
- Every **10 combined points** in a stat gives an extra bonus.
- Example: Performance **6 + 4 = 10**, so the scene gets the Performance threshold bonus.
- Boosters count for that scene's combined stat check only.

**Progression**
- Completed scenes grant XP, coins, ranking points, and scenes completed.
- Use \`/train\` to spend XP and coins on Performance, Stamina, and Fame.
- Boosters are one-use scene bonuses for the requester only.
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
