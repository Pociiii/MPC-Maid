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

function commandLine(
    name,
    channel,
    cooldown,
    description
) {

    return `\`${name}\` • ${channel} • ${cooldown}\n${description}`;

}

function cooldownLabel(
    seconds
) {

    return seconds
        ? minutes(
            seconds
        )
        : 'No CD';

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

        const dailyReset =
            timestamp(
                getNextResetTimestamp()
            );

        embed.addFields(
            {
                name:
                    'General',
                value:
[
    commandLine(
        '/profile',
        'Any',
        'No CD',
        'View a member profile.'
    ),
    commandLine(
        '/daily',
        'Any',
        `Reset ${dailyReset}`,
        'Check your personal daily quests.'
    ),
    commandLine(
        '/leaderboard',
        'Any',
        'No CD',
        'Browse server ladders.'
    ),
    commandLine(
        '/achievements',
        'Any',
        'No CD',
        'Check achievement progress.'
    )
].join(
    '\n'
),
                inline:
                    false
            },
            {
                name:
                    'Porn Career',
                value:
[
    commandLine(
        '/pornscene',
        `<#${CHANNELS.PORN_CAREER}>`,
        cooldownLabel(
            COOLDOWNS.PORN_SCENE_REQUEST
        ),
        'Make a shared career scene.'
    ),
    commandLine(
        '/customscene',
        `Any, posts in <#${CHANNELS.CUSTOM_SCENE}>`,
        cooldownLabel(
            COOLDOWNS.CUSTOM_SCENE
        ),
        'Build a solo custom scene.'
    ),
    commandLine(
        '/train',
        'Any',
        'No CD',
        'Spend XP and coins on stats.'
    ),
    commandLine(
        '/shop',
        'Any',
        'No CD',
        'Buy scene boosters.'
    ),
    commandLine(
        '/inventory',
        'Any',
        'No CD',
        'Check your boosters.'
    )
].join(
    '\n'
),
                inline:
                    false
            },
            {
                name:
                    'Showcase',
                value:
[
    commandLine(
        '/drop',
        `<#${CHANNELS.SHOWCASE}>`,
        cooldownLabel(
            COOLDOWNS.DROP
        ),
        'Post a titty drop.'
    ),
    commandLine(
        '/wiggle',
        `<#${CHANNELS.SHOWCASE}>`,
        cooldownLabel(
            COOLDOWNS.WIGGLE
        ),
        'Post a wiggle with spank buttons.'
    ),
    commandLine(
        '/flex',
        `<#${CHANNELS.SHOWCASE}>`,
        cooldownLabel(
            COOLDOWNS.FLEX
        ),
        'Post a flex with kiss button.'
    ),
    commandLine(
        '/horny',
        `<#${CHANNELS.SHOWCASE}>`,
        cooldownLabel(
            COOLDOWNS.HORNY
        ),
        'Post solo horny GIF with Help button.'
    )
].join(
    '\n'
),
                inline:
                    false
            },
            {
                name:
                    'Social / RP',
                value:
[
    commandLine(
        '/matchme',
        'Any',
        cooldownLabel(
            COOLDOWNS.MATCHME
        ),
        'Get matched with another member.'
    ),
    commandLine(
        '/breed',
        'Any',
        'No CD',
        'Send a pregnancy RP request.'
    ),
    commandLine(
        '/pregnancy',
        'Any',
        'No CD',
        'Check your own fertility and pregnancy status.'
    )
].join(
    '\n'
),
                inline:
                    false
            },
            {
                name:
                    'Casino',
                value:
[
    commandLine(
        '/dice',
        `<#${CHANNELS.CASINO}>`,
        cooldownLabel(
            COOLDOWNS.DICE
        ),
        'Bet up to 50 coins, 2d6 vs bot.'
    ),
    commandLine(
        '/blackjack',
        `<#${CHANNELS.CASINO}>`,
        cooldownLabel(
            COOLDOWNS.BLACKJACK
        ),
        'Bet up to 100 coins, play the dealer.'
    )
].join(
    '\n'
),
                inline:
                    false
            },
            {
                name:
                    'Bot Feed',
                value:
`Daily quests, achievements, and GIF approvals post in <#${CHANNELS.MAID_FEED}>.
Updates are posted in <#${CHANNELS.UPDATES}>.
More details: press the info buttons below.`,
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
            interaction.channel;

        if (
            !channel?.send
        ) {

            await interaction.reply({
                content:
                    'I could not post the command guide in this channel.',
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
                `Command guide posted here: ${message.url}`,
            flags:
                64
        });

    }

};
