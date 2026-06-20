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

    if (
        seconds >= 3600 &&
        seconds % 3600 === 0
    )
        return `${seconds / 3600} hr`;

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
                    'Commands',
                description:
`Role-based GIFs use:
Gender: <@&${ROLES.MALE}> / <@&${ROLES.FEMALE}>
Skin: <@&${ROLES.LIGHT_SKIN}> / <@&${ROLES.DARK_SKIN}>`,
                footerText:
                    '/commands',
                timestamp:
                    true
            });

        embed.addFields(
            {
                name:
                    'All channels',
                value:
`- \`/profile\` Stats and progress
- \`/train\` Raise career stats
- \`/inventory\` Your boosters
- \`/leaderboard\` Server rankings
- \`/matchme\` Random match - ${minutes(COOLDOWNS.MATCHME)}`,
                inline:
                    false
            },
            {
                name:
                    `<#${CHANNELS.SHOWCASE}>`,
                value:
`- \`/drop\` Boobies - ${minutes(COOLDOWNS.DROP)}
- \`/wiggle\` Spank button - ${minutes(COOLDOWNS.WIGGLE)}
- \`/flex\` Blow kiss button - ${minutes(COOLDOWNS.FLEX)}
- \`/horny\` Solo + Help button - ${minutes(COOLDOWNS.HORNY)}`,
                inline:
                    false
            },
            {
                name:
                    `<#${CHANNELS.PORN_CAREER}>`,
                value:
`- \`/pornscene\` Shared career scene - ${minutes(COOLDOWNS.PORN_SCENE_REQUEST)}
- \`/customscene\` Solo custom scene - ${minutes(COOLDOWNS.CUSTOM_SCENE)}`,
                inline:
                    false
            },
            {
                name:
                    'Games',
                value:
                    '- `/dice` 2d6 vs the bot',
                inline:
                    false
            },
            {
                name:
                    'Notes',
                value:
`- Media: image, GIF, or video.
- Boosters: check \`/inventory\`, use with \`/pornscene\`.
- More details: press **Porn Career Info**.

-# This bot is not hosted on a server yet, Check it's status before using it's features`,
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
