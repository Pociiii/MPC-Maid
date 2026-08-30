const {
    createEmbed
} = require('../../utils/embeds');

const {
    CHANNELS,
    getRandomColor
} = require('../../data/constants');

module.exports = {

    async execute(
        interaction
    ) {

        const embed =
            createEmbed({
                color:
                    getRandomColor(),
                title:
                    'Relationship System',
                description:
`Relationships are RP links between members. They do not give coins, XP, pregnancy bonuses, or porn career advantages.

**How it works**
- Relationship requests are sent by DM.
- The other user must press Accept before the link is created.
- Accepted links can appear in <#${CHANNELS.PILLOW_TALK}> as small RP notices.
- Use \`/relationship view user:@user\` to privately check someone's links.

**Romance**
- \`/relationship marry user:@user\` creates a marriage link.
- A user can only have one wife/hubby.
- \`/relationship date user:@user\` creates a dating link.
- Married users can still date someone else for swing/open RP.

**Family**
- \`/relationship adopt user:@user\` creates a mother/father link based on your role.
- \`/relationship abandon child:@user\` removes one of your child links.
- \`/relationship leave-parent parent:mother/father\` removes your parent link.
- \`/relationship sibling user:@user\` creates a sibling link.
- \`/relationship unsibling user:@user\` removes a sibling link.
- \`/relationship extended-family user:@user\` creates an Extended Family link.
- \`/relationship unextended-family user:@user\` removes an Extended Family link.
- The bot blocks family overlaps between the same two users, so someone cannot be parent, child, sibling, or extended family of the same person.
- Romantic links stay separate from family links.

**Social**
- \`/relationship bestie user:@user\` creates a Bestie link.
- \`/relationship unbestie user:@user\` removes a Bestie link.
- Each user can have up to **3 Besties**.

**Removing links**
- \`/relationship divorce user:@user\` removes a marriage link.
- \`/relationship breakup user:@user\` removes a dating link.
- Relationship removals are private and do not post a public notice.`,
                footerText:
                    'MPC Maid Command Guide - Relationship Info',
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
