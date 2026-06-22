const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    createBotEmbed
} = require('../../utils/embeds');

const {
    CHANNELS,
    COOLDOWNS
} = require('../../data/constants');

const {
    getNextResetTimestamp
} = require('../../features/daily-quests/dailyQuests');

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

function timestamp(
    unixTimestamp
) {

    return `<t:${unixTimestamp}:t> (<t:${unixTimestamp}:R>)`;

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
            createBotEmbed(
                interaction,
                {
                    command:
                        '/commands',
                    title:
                        'Commands',
                    description:
`Role-based GIFs use:
Gender: <@&${ROLES.MALE}> / <@&${ROLES.FEMALE}>
Skin: <@&${ROLES.LIGHT_SKIN}> / <@&${ROLES.DARK_SKIN}>`
                }
            );

        embed.addFields(
            {
                name:
                    'All channels',
                value:
`- \`/profile\` Stats and progress
- \`/daily\` Personal daily quests, resets ${timestamp(
    getNextResetTimestamp()
)}
- \`/train\` Raise career stats
- \`/shop\` Buy pornscene boosters
- \`/inventory\` Your boosters
- \`/achievements\` Achievement progress
- \`/pregnancy\` Pregnancy and fertility status
- \`/breed\` Send a pregnancy RP request
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
                    `<#${CHANNELS.CASINO}>`,
                value:
`- \`/dice\` Bet up to 50 coins, 2d6 vs bot - ${minutes(COOLDOWNS.DICE)}
- \`/blackjack\` Bet up to 100 coins, play the dealer - ${minutes(COOLDOWNS.BLACKJACK)}`,
                inline:
                    false
            },
            {
                name:
                    'Notes',
                value:
`- Media: image, GIF, or video.
- Boosters: buy with \`/shop\`, check \`/inventory\`, use with \`/pornscene\`.
- Daily quests, achievements, and GIF approvals post in <#${CHANNELS.MAID_FEED}>.
- Updates are posted in <#${CHANNELS.UPDATES}>.
- More details: press the info buttons below.

-# This bot is not hosted on a server yet, check its status before using its features.`,
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
                        .setEmoji(
                            '\uD83C\uDFAC'
                        )
                        .setStyle(
                            ButtonStyle.Secondary
                        ),
                    new ButtonBuilder()
                        .setCustomId(
                            'commands_pregnancy_info'
                        )
                        .setLabel(
                            'Pregnancy Info'
                        )
                        .setEmoji(
                            '\uD83E\uDD30'
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
