const fs =
    require('fs');

const path =
    require('path');

const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    StringSelectMenuBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

const {
    CHANNELS,
    getRandomColor
} = require('../../data/constants');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    commandFooter
} = require('../../utils/version');

const {
    getReviewChannel
} = require('./submissionFlow');

const sceneTitlePath =
    path.join(
        __dirname,
        '..',
        '..',
        'data',
        'scenes',
        'sceneNamesByCast.json'
    );

const titlePools = {
    mf:
        'MF Scene Titles',
    ff:
        'FF Scene Titles',
    shared:
        'Shared Scene Titles'
};

function getTitlePoolLabel(
    pool
) {

    return titlePools[pool] ?? titlePools.shared;

}

function normalizeTitle(
    title
) {

    return String(
        title ?? ''
    )
        .replace(
            /\s+/g,
            ' '
        )
        .trim();

}

function readSceneTitles() {

    return JSON.parse(
        fs.readFileSync(
            sceneTitlePath,
            'utf8'
        )
    );

}

function writeSceneTitles(
    titles
) {

    fs.writeFileSync(
        sceneTitlePath,
        JSON.stringify(
            titles,
            null,
            4
        )
    );

}

function findExistingTitlePool(
    title,
    titles = readSceneTitles()
) {

    const normalized =
        normalizeTitle(
            title
        ).toLowerCase();

    for (
        const [
            pool,
            values
        ] of Object.entries(
            titles
        )
    ) {

        if (
            !Array.isArray(
                values
            )
        )
            continue;

        if (
            values.some(
                (value) =>
                    normalizeTitle(
                        value
                    ).toLowerCase() === normalized
            )
        )
            return pool;

    }

    return null;

}

function addSceneTitle(
    pool,
    title
) {

    const titles =
        readSceneTitles();

    const normalizedTitle =
        normalizeTitle(
            title
        );

    const existingPool =
        findExistingTitlePool(
            normalizedTitle,
            titles
        );

    if (
        existingPool
    )
        return {
            added:
                false,
            existingPool,
            total:
                titles[pool]?.length ?? 0
        };

    if (
        !Array.isArray(
            titles[pool]
        )
    )
        titles[pool] = [];

    titles[pool].push(
        normalizedTitle
    );

    writeSceneTitles(
        titles
    );

    return {
        added:
            true,
        existingPool:
            null,
        total:
            titles[pool].length
    };

}

function getFieldValue(
    embed,
    fieldName
) {

    return embed?.fields
        ?.find(
            (field) =>
                field.name === fieldName ||
                field.name.endsWith(
                    ` ${fieldName}`
                )
        )
        ?.value;

}

function getSubmittedTitle(
    embed
) {

    return getFieldValue(
        embed,
        'Suggested Title'
    );

}

function buildSceneTitlePoolReply() {

    const menu =
        new StringSelectMenuBuilder()
            .setCustomId(
                'gif_scene_title_pool'
            )
            .setPlaceholder(
                'Choose title pool'
            )
            .addOptions(
                {
                    label:
                        titlePools.mf,
                    description:
                        'Titles for male/female scenes',
                    value:
                        'mf'
                },
                {
                    label:
                        titlePools.ff,
                    description:
                        'Titles for female/female scenes',
                    value:
                        'ff'
                },
                {
                    label:
                        titlePools.shared,
                    description:
                        'Titles that can fit any scene',
                    value:
                        'shared'
                }
            );

    return {
        content:
            'Pick where this scene title should be used:',
        components: [
            new ActionRowBuilder()
                .addComponents(
                    menu
                )
        ],
        flags:
            64
    };

}

function buildSceneTitleModal(
    pool
) {

    const titleInput =
        new TextInputBuilder()
            .setCustomId(
                'scene_title'
            )
            .setLabel(
                'Suggested scene title'
            )
            .setStyle(
                TextInputStyle.Short
            )
            .setRequired(
                true
            )
            .setMinLength(
                3
            )
            .setMaxLength(
                100
            )
            .setPlaceholder(
                'Example: Midnight Mischief'
            );

    return new ModalBuilder()
        .setCustomId(
            `scene_title_submit:${pool}`
        )
        .setTitle(
            'Scene Title Suggestion'
        )
        .addComponents(
            new ActionRowBuilder()
                .addComponents(
                    titleInput
                )
        );

}

function buildReviewEmbed(
    {
        pool,
        submitterId,
        title
    }
) {

    const embed =
        createEmbed({
            color:
                getRandomColor(),
            title:
                'Scene Title Suggestion',
            footerText:
                commandFooter(
                    '/gifsubmit'
                ),
            timestamp:
                true
        });

    embed.addFields(
        {
            name:
                'Submitted By',
            value:
                `<@${submitterId}>`,
            inline:
                true
        },
        {
            name:
                'Title Pool',
            value:
                getTitlePoolLabel(
                    pool
                ),
            inline:
                true
        },
        {
            name:
                'Suggested Title',
            value:
                title,
            inline:
                false
        }
    );

    return embed;

}

function buildReviewComponents(
    {
        pool,
        submitterId
    }
) {

    return [
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `scenetitleapprove:${pool}:${submitterId}`
                    )
                    .setLabel(
                        'Approve'
                    )
                    .setStyle(
                        ButtonStyle.Success
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        `scenetitlereject:${pool}:${submitterId}`
                    )
                    .setLabel(
                        'Reject'
                    )
                    .setStyle(
                        ButtonStyle.Danger
                    )
            )
    ];

}

function buildResultEmbed(
    {
        approvedBy,
        pool,
        submitterId,
        title,
        total
    }
) {

    const embed =
        createEmbed({
            color:
                getRandomColor(),
            title:
                'Scene Title Approved',
            footerText:
                commandFooter(
                    '/gifsubmit'
                ),
            timestamp:
                true
        });

    embed.addFields(
        {
            name:
                'Approved By',
            value:
                `${approvedBy}`,
            inline:
                true
        },
        {
            name:
                'Submitted By',
            value:
                `<@${submitterId}>`,
            inline:
                true
        },
        {
            name:
                'Title Pool',
            value:
                getTitlePoolLabel(
                    pool
                ),
            inline:
                true
        },
        {
            name:
                'Total Titles',
            value:
                String(
                    total
                ),
            inline:
                true
        },
        {
            name:
                'Suggested Title',
            value:
                title,
            inline:
                false
        }
    );

    return embed;

}

function parsePoolActionId(
    customId
) {

    const [
        ,
        pool,
        submitterId
    ] =
        customId.split(
            ':'
        );

    return {
        pool:
            titlePools[pool]
                ? pool
                : 'shared',
        submitterId
    };

}

async function submitSceneTitleSuggestion(
    interaction
) {

    const pool =
        interaction.customId.split(
            ':'
        )[1];

    const safePool =
        titlePools[pool]
            ? pool
            : 'shared';

    const title =
        normalizeTitle(
            interaction.fields.getTextInputValue(
                'scene_title'
            )
        );

    if (
        title.length < 3 ||
        title.length > 100
    ) {

        await interaction.reply({
            content:
                'Scene titles need to be between 3 and 100 characters.',
            flags:
                64
        });

        return;

    }

    const existingPool =
        findExistingTitlePool(
            title
        );

    if (
        existingPool
    ) {

        await interaction.reply({
            content:
                `That title is already in ${getTitlePoolLabel(
                    existingPool
                )}.`,
            flags:
                64
        });

        return;

    }

    const reviewChannel =
        getReviewChannel(
            interaction.client
        );

    if (
        !reviewChannel
    ) {

        await interaction.reply({
            content:
                'The review channel is not available right now, so the title was not submitted.',
            flags:
                64
        });

        return;

    }

    await reviewChannel.send({
        embeds: [
            buildReviewEmbed({
                pool:
                    safePool,
                submitterId:
                    interaction.user.id,
                title
            })
        ],
        components:
            buildReviewComponents({
                pool:
                    safePool,
                submitterId:
                    interaction.user.id
            })
    });

    await interaction.reply({
        content:
            'Scene title submitted for review.',
        flags:
            64
    });

}

async function approveSceneTitle(
    interaction
) {

    const {
        pool,
        submitterId
    } =
        parsePoolActionId(
            interaction.customId
        );

    const title =
        normalizeTitle(
            getSubmittedTitle(
                interaction.message.embeds[0]
            )
        );

    if (
        title.length < 3 ||
        title.length > 100
    ) {

        await interaction.reply({
            content:
                'That scene title is missing or outside the 3-100 character limit.',
            flags:
                64
        });

        return;

    }

    const result =
        addSceneTitle(
            pool,
            title
        );

    if (
        !result.added
    ) {

        await interaction.reply({
            content:
                `That title already exists in ${getTitlePoolLabel(
                    result.existingPool
                )}.`,
            flags:
                64
        });

        return;

    }

    await interaction.update({
        content:
            null,
        embeds: [
            buildResultEmbed({
                approvedBy:
                    interaction.user,
                pool,
                submitterId,
                title,
                total:
                    result.total
            })
        ],
        components:
            []
    });

}

async function showSceneTitleRejectModal(
    interaction
) {

    const modal =
        new ModalBuilder()
            .setCustomId(
                interaction.customId.replace(
                    'scenetitlereject',
                    'scenetitlerejectmodal'
                )
            )
            .setTitle(
                'Reject Scene Title'
            );

    const reason =
        new TextInputBuilder()
            .setCustomId(
                'reason'
            )
            .setLabel(
                'Reason'
            )
            .setStyle(
                TextInputStyle.Paragraph
            )
            .setRequired(
                true
            )
            .setPlaceholder(
                'Duplicate, too long, not the right vibe...'
            );

    modal.addComponents(
        new ActionRowBuilder()
            .addComponents(
                reason
            )
    );

    await interaction.showModal(
        modal
    );

}

async function rejectSceneTitle(
    interaction
) {

    const {
        pool,
        submitterId
    } =
        parsePoolActionId(
            interaction.customId
        );

    const title =
        normalizeTitle(
            getSubmittedTitle(
                interaction.message.embeds[0]
            )
        );

    const reason =
        interaction.fields.getTextInputValue(
            'reason'
        );

    await interaction.deferUpdate();

    let dmSent = true;

    try {

        const user =
            await interaction.client.users.fetch(
                submitterId
            );

        const dmEmbed =
            createEmbed({
                color:
                    getRandomColor(),
                title:
                    'Scene Title Suggestion Rejected',
                description:
                    'Your scene title suggestion was rejected. You can suggest another title any time.',
                footerText:
                    '/gifsubmit',
                timestamp:
                    true
            });

        dmEmbed.addFields(
            {
                name:
                    'Title Pool',
                value:
                    getTitlePoolLabel(
                        pool
                    ),
                inline:
                    true
            },
            {
                name:
                    'Suggested Title',
                value:
                    title,
                inline:
                    false
            },
            {
                name:
                    'Reason',
                value:
                    reason,
                inline:
                    false
            }
        );

        await user.send({
            embeds: [
                dmEmbed
            ]
        });

    }
    catch {

        dmSent = false;

    }

    await interaction.editReply({
        content:
`Rejected by ${interaction.user}

Reason: ${reason}

DM: ${dmSent ? 'Sent' : 'Failed (DMs closed)'}`,
        embeds:
            interaction.message.embeds,
        components:
            []
    });

}

module.exports = {
    approveSceneTitle,
    buildSceneTitleModal,
    buildSceneTitlePoolReply,
    rejectSceneTitle,
    showSceneTitleRejectModal,
    submitSceneTitleSuggestion
};
