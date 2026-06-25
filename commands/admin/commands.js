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

    return `\`${name}\`\n📍 ${channel} • ⏱️ ${cooldown}\n${description}`;

}

function cooldownLabel(
    seconds
) {

    return seconds
        ? `Cooldown: ${minutes(
            seconds
        )}`
        : 'No cooldown';

}

function requestCooldownLabel(
    seconds
) {

    return `Request cooldown: ${minutes(
        seconds
    )}`;

}

function resetLabel(
    resetAt
) {

    return `Daily reset: ${resetAt}`;

}

const privateChannelLabel =
    'Any channel, private reply';

function postsIn(
    channelId
) {

    return `Use anywhere, posts in <#${channelId}>`;

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

        await interaction.deferReply({
            flags:
                64
        });

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
        privateChannelLabel,
        cooldownLabel(),
        'View a profile or compare stats.'
    ),
    commandLine(
        '/daily',
        privateChannelLabel,
        resetLabel(
            dailyReset
        ),
        'Check your personal daily quests.'
    ),
    commandLine(
        '/leaderboard',
        privateChannelLabel,
        cooldownLabel(),
        'Browse server ladders.'
    ),
    commandLine(
        '/achievements',
        privateChannelLabel,
        cooldownLabel(),
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
        `Use anywhere, scenes in <#${CHANNELS.PORN_CAREER}>, notices in <#${CHANNELS.RUMORS}>`,
        requestCooldownLabel(
            COOLDOWNS.PORN_SCENE_REQUEST
        ),
        'Make a shared career scene.'
    ),
    commandLine(
        '/customscene',
        postsIn(
            CHANNELS.CUSTOM_SCENE
        ),
        cooldownLabel(
            COOLDOWNS.CUSTOM_SCENE
        ),
        'Build a solo custom scene.'
    ),
    commandLine(
        '/train',
        privateChannelLabel,
        cooldownLabel(),
        'Spend XP and coins on stats.'
    ),
    commandLine(
        '/shop',
        privateChannelLabel,
        cooldownLabel(),
        'Buy tiered scene boosters.'
    ),
    commandLine(
        '/inventory',
        privateChannelLabel,
        cooldownLabel(),
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
        `<#${CHANNELS.TITTY_DROP}>`,
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
        'Post a flex with Kiss and Brofist buttons.'
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
        'Any channel, public reply',
        cooldownLabel(
            COOLDOWNS.MATCHME
        ),
        'Get matched with another member.'
    ),
    commandLine(
        '/breed',
        `Any channel, notices in <#${CHANNELS.RUMORS}>`,
        cooldownLabel(),
        'Send a pregnancy RP request.'
    ),
    commandLine(
        '/pregnancy',
        privateChannelLabel,
        cooldownLabel(),
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
        '/slots',
        `<#${CHANNELS.CASINO}>`,
        cooldownLabel(
            COOLDOWNS.SLOTS
        ),
        'Bet up to 75 coins, spin for multipliers.'
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

            await interaction.editReply({
                content:
                    'I could not post the command guide in this channel.'
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

        await interaction.editReply({
            content:
                `Command guide posted here: ${message.url}`
        });

    }

};
