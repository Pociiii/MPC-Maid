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
- \`/daily\` Personal daily quests, reset 12:00 UTC
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
                    `- \`/dice\` Bet up to 50 coins, 2d6 vs bot - ${minutes(COOLDOWNS.DICE)}`,
                inline:
                    false
            },
            {
                name:
                    'Notes',
                value:
`- Media: image, GIF, or video.
- Boosters: check \`/inventory\`, use with \`/pornscene\`.
- Daily quests and achievements announce completions in rumors.
- Updates are posted in <#${CHANNELS.UPDATES}>.
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

        const channel =
            interaction.client.channels.cache.get(
                CHANNELS.COMMANDS
            ) ??
            await interaction.client.channels.fetch(
                CHANNELS.COMMANDS
            ).catch(
                () => null
            );

        if (
            !channel?.send
        ) {

            await interaction.reply({
                content:
                    'I could not find the command channel.',
                flags:
                    64
            });

            return;

        }

        const message =
            await channel.send({
                embeds: [
                    embed
                ],
                components: [
                    row
                ]
            });

        await interaction.reply({
            content:
                `Command guide posted in <#${CHANNELS.COMMANDS}>: ${message.url}`,
            flags:
                64
        });

    }

};
