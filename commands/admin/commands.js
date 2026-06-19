const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    CHANNELS,
    COOLDOWNS,
    getRandomColor
} = require('../../data/constants');

const ROLES =
    require('../../data/roles.json');

function minutes(
    seconds
) {

    return `${Math.floor(
        seconds / 60
    )} min`;

}

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'commands'
            )
            .setDescription(
                'Post the MPC Maid command guide'
            ),

    async execute(
        interaction
    ) {

        const embed =
            createEmbed({
                color:
                    getRandomColor(),
                authorName:
                    interaction.client.user.username,
                authorIcon:
                    interaction.client.user.displayAvatarURL(),
                title:
                    'MPC Maid Command Guide',
                description:
`Most adult commands use your server roles to pick the correct GIFs and scene categories.

Required role setup:
- Gender: <@&${ROLES.MALE}> or <@&${ROLES.FEMALE}>
- Skin tone: <@&${ROLES.LIGHT_SKIN}> or <@&${ROLES.DARK_SKIN}>`,
                footerText:
                    '/commands',
                timestamp:
                    true
            });

        embed.addFields(
            {
                name:
                    'Profile',
                value:
                    '- `/profile` View your profile, stats, XP, ranking, and career progress.',
                inline:
                    false
            },
            {
                name:
                    'Showcase Commands',
                value:
`- \`/drop\` Post a titty drop. Optional custom media. Cooldown: ${minutes(COOLDOWNS.DROP)}.
- \`/wiggle\` Post a wiggle GIF. Other users can press Spank. Cooldown: ${minutes(COOLDOWNS.WIGGLE)}.
- \`/flex\` Post a flex GIF. Other users can press Blow Kiss. Cooldown: ${minutes(COOLDOWNS.FLEX)}.
- \`/horny\` Post a solo horny GIF based on your roles. Other users can press Help. Cooldown: ${minutes(COOLDOWNS.HORNY)}.`,
                inline:
                    false
            },
            {
                name:
                    'Porn Career',
                value:
`- \`/pornscene\` Request a scene with another user by DM. Requests can wait; busy is checked only when accepted. Cooldown: ${minutes(COOLDOWNS.PORN_SCENE_REQUEST)}.
- \`/customscene\` Build a solo custom scene with up to 8 parts. Posts over 30 minutes in <#${CHANNELS.CUSTOM_SCENE}>. Cooldown: ${minutes(COOLDOWNS.CUSTOM_SCENE)}.

Porn scenes post in <#${CHANNELS.PORN_CAREER}> and rumors post in <#${CHANNELS.RUMORS}>.
Performance affects XP, Stamina affects scene length, Fame affects viewers/revenue, and outcome affects Ranking.`,
                inline:
                    false
            },
            {
                name:
                    'Games',
                value:
                    '- `/dice` Roll 2d6 against the bot.',
                inline:
                    false
            },
            {
                name:
                    'Quick Notes',
                value:
`- Custom media must be an image, GIF, or video.
- Scene categories are chosen from both users' gender and skin tone roles.
- GIF submissions are reviewed before being added.
- A requester can only have one pending /pornscene request with the same target while the bot is running.`,
                inline:
                    false
            }
        );

        const row =
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(
                            'commands_porncareer_info'
                        )
                        .setLabel(
                            'Porn Career Info'
                        )
                        .setStyle(
                            ButtonStyle.Secondary
                        )
                );

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });

    }

};
