const {
    createEmbed
} = require('../../utils/embeds');

const {
    getNextPregnancyCheckTimestamp
} = require('../../database/pregnancy');

const {
    getRandomColor
} = require('../../data/constants');

const {
    PREGNANCY
} = require('../../data/pregnancyConfig');

module.exports = {

    async execute(
        interaction
    ) {

        const nextCheck =
            getNextPregnancyCheckTimestamp();

        const embed =
            createEmbed({
                color:
                    getRandomColor(),
                title:
                    'Pregnancy System',
                description:
`Pregnancy is a slow RP system, separate from porn career.

**How it starts**
- Use \`/breed partner:@user\`.
- The other member must accept the request in DM.
- A member with the Female role can carry; Male and Female members can be partners.
- If both members can carry, the requester chooses the carrier.
- Accepting adds that partner to the carrier's list for the current daily check; it does not cause an immediate pregnancy.

**Daily check**
- Each eligible carrier receives at most **one pregnancy roll per day**.
- Next check: <t:${nextCheck}:F> (<t:${nextCheck}:R>).
- Daily fertility is **${PREGNANCY.MIN_DAILY_FERTILITY}% to ${PREGNANCY.MAX_DAILY_FERTILITY}%** per member.
- The roll combines the carrier's fertility with one partner's fertility, capped at **${PREGNANCY.MAX_PREGNANCY_CHANCE}%**.
- Use \`/shop fertility\` to activate a **${PREGNANCY.FERTILITY_PILL_COST}-coin** pill for the current pregnancy day. Each selected participant's active pill adds **+${PREGNANCY.FERTILITY_PILL_BONUS} points**, without exceeding the cap.
- Multiple accepted partners do not create extra rolls; one is selected randomly for that day's check.
- Failed rolls stay private.

**Pregnancy**
- Pregnancy lasts **${PREGNANCY.DURATION_DAYS} days**.
- The baby's gender is revealed on **Day ${PREGNANCY.GENDER_REVEAL_DAY}**.
- Birth happens on **Day ${PREGNANCY.DURATION_DAYS}**.
- Use \`/pregnancy\` to privately check fertility, pregnancy status, children, and history.`,
                footerText:
                    'MPC Maid Command Guide - Pregnancy Info',
                timestamp:
                    true
            });

        await interaction.reply({
            embeds: [
                embed
            ],
            flags:
                64
        });

    }

};
