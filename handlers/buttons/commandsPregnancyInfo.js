const {
    createEmbed
} = require('../../utils/embeds');

const {
    getNextPregnancyCheckTimestamp
} = require('../../database/pregnancy');

const {
    getRandomColor
} = require('../../data/constants');

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
- The other user must accept in DM.
- Female/Female works too for futa RP.
- If both can carry, the requester chooses who carries.

**Daily check**
- Pregnancy rolls happen **once per day**.
- Next check: <t:${nextCheck}:F> (<t:${nextCheck}:R>).
- Every user receives a daily fertility value from **3% to 7%**.
- Pregnancy chance is the carrier's fertility plus one randomly selected partner's fertility (**6% to 14%**).
- More partners do not create more rolls.
- If there are multiple partners, one is selected randomly.
- Failed rolls stay private.

**Pregnancy**
- Full pregnancy lasts **30 days**.
- Gender reveal happens on **Day 7**.
- Birth happens on **Day 30**.
- Use \`/pregnancy\` to check your own private status.`,
                footerText:
                    '/commands - Pregnancy Info',
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
