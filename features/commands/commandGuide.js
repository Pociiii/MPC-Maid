const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder
} = require('discord.js');

const {
    createEmbed
} = require('../../utils/embeds');

const db =
    require('../../database/database');

const {
    logError,
    logWarning
} = require('../../utils/inboxLogger');

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

const {
    getStudioNpc
} = require('../../data/studioNpcs');

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
        name:
            `\uD83D\uDD39 ${name}`,
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

    const personalAgent =
        getStudioNpc(
            'personal_agent'
        );

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
                    '/achievements',
                    '/mpcopen'
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
                ),
                commandDetail(
                    '/mpcopen',
                    'Any channel, public announcement',
                    'None',
                    'Announce an open MPC room with host text and optional media.'
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
                    '/mystudio',
                    '/studios',
                    '/customscene',
                    '/train',
                    '/shop boosters',
                    '/inventory boosters'
                ]),
            commands: [
                commandDetail(
                    '/pornscene',
                    `Any channel. Scenes in <#${CHANNELS.PORN_CAREER}>. Notices in <#${CHANNELS.MOMENTS}>.`,
                    requestCooldownLabel(
                        COOLDOWNS.PORN_SCENE_REQUEST
                    ),
                    'Make a shared porn career scene. Active filming resumes after bot restarts.'
                ),
                commandDetail(
                    '/mystudio',
                    privateReply,
                    `Upkeep resets ${dailyReset}`,
                    `Buy, close, reopen, and manage staff for a player studio. The overview shows previous-day gameplay income. Closing pauses all upkeep; reopening costs ${ECONOMY.STUDIO_REOPEN_COST} coins. Studio: ${ECONOMY.STUDIO_PURCHASE_COST} coins plus ${ECONOMY.STUDIO_DAILY_UPKEEP}/day. Personal Agent: ${personalAgent.hireCost} coins plus ${personalAgent.dailyUpkeep}/day.`
                ),
                commandDetail(
                    '/studios',
                    'Any channel, public reply',
                    'None',
                    'Browse open player studios and their production threads.'
                ),
                commandDetail(
                    '/customscene',
                    `Posts in <#${CHANNELS.CUSTOM_SCENE}>.`,
                    cooldownLabel(
                        COOLDOWNS.CUSTOM_SCENE
                    ),
                    `Build a solo custom scene. Costs ${ECONOMY.CUSTOM_SCENE_PART_COST} coins per selected part and resumes after bot restarts.`
                ),
                commandDetail(
                    '/train',
                    privateReply,
                    'None',
                    'Spend XP and coins on Performance, Stamina, and Fame.'
                ),
                commandDetail(
                    '/shop boosters',
                    privateReply,
                    'None',
                    'Buy tiered scene boosters.'
                ),
                commandDetail(
                    '/inventory boosters',
                    privateReply,
                    'None',
                    'Check your boosters.'
                )
            ]
        },
        drops: {
            label:
                'Drops',
            emoji:
                '🍈',
            summary:
                commandSummary([
                    '/drop'
                ]),
            commands: [
                commandDetail(
                    '/drop',
                    `<#${CHANNELS.TITTY_DROP}>`,
                    cooldownLabel(
                        COOLDOWNS.DROP
                    ),
                    `Post a standalone titty drop. Costs ${ECONOMY.DROP_COST} coins.`
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
                    '/wiggle',
                    '/flex',
                    '/horny'
                ]),
            commands: [
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
                    '/gift send',
                    '/shop gifts',
                    '/inventory gifts',
                    '/drink',
                    '/firework',
                    '/breed',
                    '/pregnancy'
                ]),
            commands: [
                commandDetail(
                    '/gift send',
                    `Any channel, private flow. Gift notice in <#${CHANNELS.PILLOW_TALK}>.`,
                    'None',
                    'Send an owned gift as a permanent profile collectible.'
                ),
                commandDetail(
                    '/shop gifts',
                    privateReply,
                    `Rotates ${dailyReset}`,
                    'Browse your personal daily gift selection.'
                ),
                commandDetail(
                    '/inventory gifts',
                    privateReply,
                    'None',
                    'Check gifts you currently own and can send.'
                ),
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
                    `Manage RP relationships, including Extended Family links. Notices in <#${CHANNELS.PILLOW_TALK}>.`
                ),
                commandDetail(
                    '/drink',
                    'Any channel, public reply',
                    cooldownLabel(
                        COOLDOWNS.DRINK
                    ),
                    `Spend ${ECONOMY.DRINK_COST} coins to give ${ECONOMY.DRINK_XP_REWARD} XP to everyone online.`
                ),
                commandDetail(
                    '/firework',
                    'Any channel, public reply',
                    cooldownLabel(
                        COOLDOWNS.FIREWORK
                    ),
                    `Spend ${ECONOMY.FIREWORK_COST} coins on a public flex with no XP reward.`
                ),
                commandDetail(
                    '/breed',
                    `Any channel. Notices in <#${CHANNELS.PILLOW_TALK}>.`,
                    'None',
                    'Send a pregnancy RP request.'
                ),
                commandDetail(
                    '/pregnancy',
                    privateReply,
                    'None',
                    'Check your private daily fertility value and pregnancy status.'
                )
            ]
        },
        casino: {
            label:
                'Casino',
            emoji:
                '🎰',
            summary:
                `${commandSummary([
                    '/dice',
                    '/slots',
                    '/blackjack',
                    '/holdem',
                    '/lottery'
                ])}
- <#${CHANNELS.SPANK_DILLI}> panel`,
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
                ),
                commandDetail(
                    '/holdem',
                    `<#${CHANNELS.CASINO}>`,
                    cooldownLabel(
                        COOLDOWNS.HOLDEM
                    ),
                    'Bet up to 50 coins per street, play Texas Hold\'em against the dealer.'
                ),
                commandDetail(
                    'Spank Dilli Panel',
                    `<#${CHANNELS.SPANK_DILLI}>`,
                    'None',
                    'Use the permanent button to play for the shared prize.'
                ),
                commandDetail(
                    '/lottery',
                    `Any channel, private reply. Public panel in <#${CHANNELS.LOTTERY}>.`,
                    'None',
                    `Buy up to ${ECONOMY.LOTTERY_MAX_TICKETS_PER_USER} weekly tickets for ${ECONOMY.LOTTERY_TICKET_PRICE} coins each.`
                )
            ]
        },
        feeds: {
            label:
                'Feeds',
            emoji:
                '📣',
            summary:
                `<#${CHANNELS.GIFS}> <#${CHANNELS.MAID_FEED}> <#${CHANNELS.MOMENTS}> <#${CHANNELS.PILLOW_TALK}> <#${CHANNELS.EDITING_ROOM}> <#${CHANNELS.UPDATES}>`,
            commands: [
                commandDetail(
                    'GIF Submission Panel',
                    `<#${CHANNELS.GIFS}>`,
                    'None',
                    'Submit scene GIFs, interaction GIFs, or scene-title suggestions.'
                ),
                commandDetail(
                    'Maid Feed',
                    `<#${CHANNELS.MAID_FEED}>`,
                    'Automatic',
                    'Daily quests, achievements, and bot feed posts.'
                ),
                commandDetail(
                    'Moments',
                    `<#${CHANNELS.MOMENTS}>`,
                    'Automatic',
                    'Porn scene notices and group moments.'
                ),
                commandDetail(
                    'Pillow Talk',
                    `<#${CHANNELS.PILLOW_TALK}>`,
                    'Automatic',
                    'Profile likes, relationship links, gifts, and pregnancy RP notices.'
                ),
                commandDetail(
                    'Editing Room',
                    `<#${CHANNELS.EDITING_ROOM}>`,
                    'Automatic',
                    'Accepted GIF notifications.'
                ),
                commandDetail(
                    'Updates',
                    `<#${CHANNELS.UPDATES}>`,
                    'Manual',
                    'Patch notes and bot updates.'
                ),
                commandDetail(
                    'Daily WYR',
                    `<#${CHANNELS.GENERAL}>`,
                    'Automatic',
                    'Daily Would You Rather vote with a discussion thread.'
                )
            ]
        }
    };

}

function buildCommandOverviewEmbed(
    client
) {

    const sections =
        buildSections();

    const embed =
        createEmbed({
            color:
                getRandomColor(),
            authorName:
                client.user.username,
            title:
                'MPC Maid Commands',
            description:
                'Pick a section from the menu for channels, cooldowns, and short notes.',
            footerText:
                'MPC Maid Command Guide',
            timestamp:
                true
        });

    embed.addFields(
        {
            name:
                'Role-Based GIFs',
            value:
`- Gender: <@&${ROLES.MALE}> / <@&${ROLES.FEMALE}>
- Skin: <@&${ROLES.LIGHT_SKIN}> / <@&${ROLES.DARK_SKIN}>`,
            inline:
                false
        },
        ...Object.values(
            sections
        ).map(
            (section) => ({
                name:
                    `${section.emoji} ${section.label}`,
                value:
                    section.summary,
                inline:
                    true
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
                'MPC Maid Command Guide',
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
                    true
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

function dbRun(
    sql,
    params = []
) {

    return new Promise(
        (resolve, reject) =>
            db.run(
                sql,
                params,
                function onRun(error) {
                    error
                        ? reject(error)
                        : resolve({
                            changes: this.changes,
                            lastID: this.lastID
                        });
                }
            )
    );

}

function dbGet(
    sql,
    params = []
) {

    return new Promise(
        (resolve, reject) =>
            db.get(
                sql,
                params,
                (error, row) =>
                    error
                        ? reject(error)
                        : resolve(row)
            )
    );

}

async function getCommandGuideChannel(
    client
) {

    return client.channels.cache.get(
        CHANNELS.COMMANDS
    ) ??
        await client.channels.fetch(
            CHANNELS.COMMANDS
        ).catch(
            () => null
        );

}

function buildCommandGuideMessage(
    client
) {

    return {
        embeds: [
            buildCommandOverviewEmbed(
                client
            )
        ],
        components:
            buildCommandGuideComponents()
    };

}

async function findExistingCommandGuide(
    channel,
    client
) {

    const messages =
        await channel.messages.fetch({
            limit:
                100
        }).catch(
            () => null
        );

    return messages?.find(
        (message) =>
            message.author?.id === client.user.id &&
            message.embeds?.some(
                (embed) =>
                    embed.title === 'MPC Maid Commands'
            )
    ) ?? null;

}

async function ensurePersistentCommandGuide(
    client
) {

    const channel =
        await getCommandGuideChannel(
            client
        );

    if (
        !channel?.messages?.fetch ||
        !channel?.send
    ) {

        void logWarning(
            client,
            {
                title:
                    'Command Guide Channel Missing',
                description:
                    `Could not use <#${CHANNELS.COMMANDS}> for the command guide.`
            }
        );

        return null;

    }

    await dbRun(
        `INSERT OR IGNORE INTO command_guide_settings (
            id,
            channel_id,
            updated_at
        ) VALUES (1, ?, ?)`,
        [
            CHANNELS.COMMANDS,
            Date.now()
        ]
    );

    const settings =
        await dbGet(
            'SELECT * FROM command_guide_settings WHERE id = 1'
        );

    let message =
        settings?.message_id
            ? await channel.messages.fetch(
                settings.message_id
            ).catch(
                () => null
            )
            : null;

    if (
        !message
    )
        message =
            await findExistingCommandGuide(
                channel,
                client
            );

    if (
        message
    )
        await message.edit(
            buildCommandGuideMessage(
                client
            )
        );
    else
        message =
            await channel.send(
                buildCommandGuideMessage(
                    client
                )
            );

    await dbRun(
        `UPDATE command_guide_settings
         SET channel_id = ?, message_id = ?, updated_at = ?
         WHERE id = 1`,
        [
            CHANNELS.COMMANDS,
            message.id,
            Date.now()
        ]
    );

    return message;

}

async function startCommandGuide(
    client
) {

    try {

        return await ensurePersistentCommandGuide(
            client
        );

    }
    catch (error) {

        void logError(
            client,
            {
                title:
                    'Command Guide Startup Failed',
                error,
                fields: [
                    {
                        name:
                            '📍 Channel',
                        value:
                            `<#${CHANNELS.COMMANDS}>`,
                        inline:
                            true
                    }
                ]
            }
        );

        return null;

    }

}

module.exports = {
    buildCommandGuideComponents,
    buildCommandOverviewEmbed,
    buildCommandSectionEmbed,
    ensurePersistentCommandGuide,
    startCommandGuide
};
