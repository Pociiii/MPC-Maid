const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder
} = require('discord.js');

const {
    createBotEmbed,
    createEmbed
} = require('../../utils/embeds');

const {
    CHANNELS,
    COOLDOWNS,
    ECONOMY,
    getRandomColor
} = require('../../data/constants');

const {
    getNextResetTimestamp
} = require('../daily-quests/dailyQuests');

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

function cooldownLabel(
    seconds
) {

    return seconds
        ? minutes(
            seconds
        )
        : 'None';

}

function requestCooldownLabel(
    seconds
) {

    return `Request: ${minutes(
        seconds
    )}`;

}

function commandSummary(
    names
) {

    return names
        .map(
            (name) =>
                `- \`${name}\``
        )
        .join(
            '\n'
        );

}

function commandDetail(
    name,
    channel,
    cooldown,
    description
) {

    return {
        name,
        value:
`- Channel: ${channel}
- Cooldown: ${cooldown}
- ${description}`
    };

}

function buildSections() {

    const dailyReset =
        timestamp(
            getNextResetTimestamp()
        );

    const privateReply =
        'Any channel, private reply';

    return {
        general: {
            label:
                'General',
            emoji:
                '📌',
            summary:
                commandSummary([
                    '/profile',
                    '/daily',
                    '/leaderboard',
                    '/achievements'
                ]),
            commands: [
                commandDetail(
                    '/profile',
                    privateReply,
                    'None',
                    'View a profile or compare stats.'
                ),
                commandDetail(
                    '/daily',
                    privateReply,
                    `Resets ${dailyReset}`,
                    'Personal daily quests, streaks, and lucky boosters.'
                ),
                commandDetail(
                    '/leaderboard',
                    privateReply,
                    'None',
                    'Browse server ladders.'
                ),
                commandDetail(
                    '/achievements',
                    privateReply,
                    'None',
                    'Check achievement progress.'
                )
            ]
        },
        porncareer: {
            label:
                'Porn Career',
            emoji:
                '🎬',
            summary:
                commandSummary([
                    '/pornscene',
                    '/customscene',
                    '/train',
                    '/shop',
                    '/inventory'
                ]),
            commands: [
                commandDetail(
                    '/pornscene',
                    `Any channel. Scenes in <#${CHANNELS.PORN_CAREER}>. Notices in <#${CHANNELS.MOMENTS}>.`,
                    requestCooldownLabel(
                        COOLDOWNS.PORN_SCENE_REQUEST
                    ),
                    'Make a shared porn career scene.'
                ),
                commandDetail(
                    '/customscene',
                    `Posts in <#${CHANNELS.CUSTOM_SCENE}>.`,
                    cooldownLabel(
                        COOLDOWNS.CUSTOM_SCENE
                    ),
                    `Build a solo custom scene. Costs ${ECONOMY.CUSTOM_SCENE_PART_COST} coins per selected part.`
                ),
                commandDetail(
                    '/train',
                    privateReply,
                    'None',
                    'Spend XP and coins on Performance, Stamina, and Fame.'
                ),
                commandDetail(
                    '/shop',
                    privateReply,
                    'None',
                    'Buy tiered scene boosters.'
                ),
                commandDetail(
                    '/inventory',
                    privateReply,
                    'None',
                    'Check your boosters.'
                )
            ]
        },
        showcase: {
            label:
                'Showcase',
            emoji:
                '🔥',
            summary:
                commandSummary([
                    '/drop',
                    '/wiggle',
                    '/flex',
                    '/horny'
                ]),
            commands: [
                commandDetail(
                    '/drop',
                    `<#${CHANNELS.TITTY_DROP}>`,
                    cooldownLabel(
                        COOLDOWNS.DROP
                    ),
                    'Post a titty drop.'
                ),
                commandDetail(
                    '/wiggle',
                    `<#${CHANNELS.SHOWCASE}>`,
                    cooldownLabel(
                        COOLDOWNS.WIGGLE
                    ),
                    'Post a wiggle with spank buttons.'
                ),
                commandDetail(
                    '/flex',
                    `<#${CHANNELS.SHOWCASE}>`,
                    cooldownLabel(
                        COOLDOWNS.FLEX
                    ),
                    'Post a flex with Kiss and Brofist buttons.'
                ),
                commandDetail(
                    '/horny',
                    `<#${CHANNELS.SHOWCASE}>`,
                    cooldownLabel(
                        COOLDOWNS.HORNY
                    ),
                    'Post a solo horny GIF with Help button.'
                )
            ]
        },
        social: {
            label:
                'Social / RP',
            emoji:
                '💬',
            summary:
                commandSummary([
                    '/matchme',
                    '/relationship',
                    '/breed',
                    '/pregnancy'
                ]),
            commands: [
                commandDetail(
                    '/matchme',
                    'Any channel, public reply',
                    cooldownLabel(
                        COOLDOWNS.MATCHME
                    ),
                    'Get matched with another member.'
                ),
                commandDetail(
                    '/relationship',
                    privateReply,
                    'None',
                    'Manage RP relationships and view links.'
                ),
                commandDetail(
                    '/breed',
                    `Any channel. Notices in <#${CHANNELS.MOMENTS}>.`,
                    'None',
                    'Send a pregnancy RP request.'
                ),
                commandDetail(
                    '/pregnancy',
                    privateReply,
                    'None',
                    'Check your own fertility and pregnancy status.'
                )
            ]
        },
        casino: {
            label:
                'Casino',
            emoji:
                '🎰',
            summary:
                commandSummary([
                    '/dice',
                    '/slots',
                    '/blackjack'
                ]),
            commands: [
                commandDetail(
                    '/dice',
                    `<#${CHANNELS.CASINO}>`,
                    cooldownLabel(
                        COOLDOWNS.DICE
                    ),
                    'Bet up to 50 coins, 2d6 vs bot.'
                ),
                commandDetail(
                    '/slots',
                    `<#${CHANNELS.CASINO}>`,
                    cooldownLabel(
                        COOLDOWNS.SLOTS
                    ),
                    'Bet up to 25 coins per spin, then use Spin Again or Leave.'
                ),
                commandDetail(
                    '/blackjack',
                    `<#${CHANNELS.CASINO}>`,
                    cooldownLabel(
                        COOLDOWNS.BLACKJACK
                    ),
                    'Bet up to 100 coins, play the dealer.'
                )
            ]
        },
        feeds: {
            label:
                'Feeds',
            emoji:
                '📣',
            summary:
                `<#${CHANNELS.MAID_FEED}> <#${CHANNELS.MOMENTS}> <#${CHANNELS.UPDATES}>`,
            commands: [
                commandDetail(
                    'Maid Feed',
                    `<#${CHANNELS.MAID_FEED}>`,
                    'Automatic',
                    'Daily quests, achievements, GIF approvals, and bot feed posts.'
                ),
                commandDetail(
                    'Moments',
                    `<#${CHANNELS.MOMENTS}>`,
                    'Automatic',
                    'Porn scene notices, relationship links, pregnancy RP notices, and group moments.'
                ),
                commandDetail(
                    'Updates',
                    `<#${CHANNELS.UPDATES}>`,
                    'Manual',
                    'Patch notes and bot updates.'
                )
            ]
        }
    };

}

function buildCommandOverviewEmbed(
    interaction
) {

    const sections =
        buildSections();

    const embed =
        createBotEmbed(
            interaction,
            {
                command:
                    '/commands',
                title:
                    'MPC Maid Commands',
                description:
`Pick a section from the menu for channels, cooldowns, and short notes.

Role-based GIFs use:
- Gender: <@&${ROLES.MALE}> / <@&${ROLES.FEMALE}>
- Skin: <@&${ROLES.LIGHT_SKIN}> / <@&${ROLES.DARK_SKIN}>`
            }
        );

    embed.addFields(
        ...Object.values(
            sections
        ).map(
            (section) => ({
                name:
                    `${section.emoji} ${section.label}`,
                value:
                    section.summary,
                inline:
                    false
            })
        )
    );

    return embed;

}

function buildCommandSectionEmbed(
    sectionKey
) {

    const section =
        buildSections()[sectionKey] ??
        buildSections().general;

    const embed =
        createEmbed({
            color:
                getRandomColor(),
            title:
                `${section.emoji} ${section.label} Commands`,
            description:
                'Short version only. Big systems have their own info buttons.',
            footerText:
                '/commands',
            timestamp:
                true
        });

    embed.addFields(
        ...section.commands.map(
            (command) => ({
                name:
                    command.name,
                value:
                    command.value,
                inline:
                    false
            })
        )
    );

    return embed;

}

function buildCommandGuideComponents() {

    const sections =
        buildSections();

    const menu =
        new StringSelectMenuBuilder()
            .setCustomId(
                'commands_section'
            )
            .setPlaceholder(
                'Pick a command section'
            )
            .addOptions(
                ...Object.entries(
                    sections
                ).map(
                    ([
                        value,
                        section
                    ]) => ({
                        label:
                            section.label,
                        value,
                        emoji:
                            section.emoji
                    })
                )
            );

    const menuRow =
        new ActionRowBuilder()
            .addComponents(
                menu
            );

    const infoRow =
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
                        '🎬'
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
                        '🤰'
                    )
                    .setStyle(
                        ButtonStyle.Secondary
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        'commands_relationship_info'
                    )
                    .setLabel(
                        'Relationship Info'
                    )
                    .setEmoji(
                        '💬'
                    )
                    .setStyle(
                        ButtonStyle.Secondary
                    )
            );

    return [
        menuRow,
        infoRow
    ];

}

module.exports = {
    buildCommandGuideComponents,
    buildCommandOverviewEmbed,
    buildCommandSectionEmbed
};
