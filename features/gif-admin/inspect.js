const fs =
    require('fs');

const path =
    require('path');

const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField,
    StringSelectMenuBuilder
} = require('discord.js');

const {
    getSceneCategoryLabel,
    sceneGroups
} = require('../../data/sceneSubmitGroups');

const {
    getRandomColor
} = require('../../data/constants');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    clearGifCache
} = require('../../utils/gifs');

const {
    logBotEvent
} = require('../../utils/inboxLogger');

const {
    commandFooter
} = require('../../utils/version');

const {
    getRuntimeDataPath
} = require('../../utils/runtimeData');

const dataRoot =
    getRuntimeDataPath();

const poolLabels = {
    scene2:
        '2-Person Scene',
    scene3:
        '3-Person Scene',
    interaction:
        'Interaction'
};

const twoPersonCategories = [
    ...Object.keys(
        sceneGroups.mf.categories
    ),
    ...Object.keys(
        sceneGroups.ff.categories
    )
];

const threePersonCategories = [
    'mfm',
    'fmf',
    'fff'
];

const interactionCategories = [
    'blowkiss',
    'brofist',
    'drink',
    'firework',
    'flex_b',
    'flex_w',
    'horny',
    'spank',
    'titty_drop',
    'wiggle'
];

const scene2Subcategories = [
    'foreplay',
    'oral',
    'sex',
    'finale'
];

const scene3Subcategories = [
    'foreplay',
    'sex',
    'finale'
];

const hornySubcategories = [
    'wm',
    'bm',
    'wf',
    'bf'
];

function safeSubcategory(
    subcategory
) {

    return subcategory || '_';

}

function parseSubcategory(
    subcategory
) {

    return subcategory === '_'
        ? null
        : subcategory;

}

function titleCase(
    value
) {

    return value
        .split(
            '_'
        )
        .map(
            (part) =>
                part.charAt(
                    0
                ).toUpperCase() +
                part.slice(
                    1
                )
        )
        .join(
            ' '
        );

}

function readGifList(
    filePath
) {

    return JSON.parse(
        fs.readFileSync(
            filePath,
            'utf8'
        )
    );

}

function writeGifList(
    filePath,
    gifs
) {

    fs.writeFileSync(
        filePath,
        JSON.stringify(
            gifs,
            null,
            4
        )
    );

}

async function guardStaff(
    interaction
) {

    if (
        interaction.memberPermissions?.has(
            PermissionsBitField.Flags.Administrator
        )
    )
        return false;

    const payload = {
        content:
            'Only staff can use GIF admin tools.',
        flags:
            64
    };

    if (
        interaction.replied ||
        interaction.deferred
    )
        await interaction.followUp(
            payload
        );
    else
        await interaction.reply(
            payload
        );

    return true;

}

function sceneGroupForTwoPersonCategory(
    category
) {

    return sceneGroups.mf.categories[category]
        ? 'mf'
        : 'ff';

}

function getCategoryChoices(
    pool
) {

    if (
        pool === 'scene2'
    )
        return twoPersonCategories;

    if (
        pool === 'scene3'
    )
        return threePersonCategories;

    if (
        pool === 'interaction'
    )
        return interactionCategories;

    return [];

}

function getSubcategoryChoices(
    pool,
    category
) {

    if (
        pool === 'scene2'
    )
        return scene2Subcategories;

    if (
        pool === 'scene3'
    )
        return scene3Subcategories;

    if (
        pool === 'interaction' &&
        category === 'horny'
    )
        return hornySubcategories;

    return [];

}

function getFilePath(
    pool,
    category,
    subcategory
) {

    if (
        pool === 'scene2'
    )
        return path.join(
            dataRoot,
            'scenes',
            category,
            `${subcategory}.json`
        );

    if (
        pool === 'interaction' &&
        category === 'horny'
    )
        return path.join(
            dataRoot,
            'gifs',
            'horny',
            `${subcategory}.json`
        );

    if (
        pool === 'interaction'
    )
        return path.join(
            dataRoot,
            'gifs',
            `${category}.json`
        );

    return null;

}

function getThreePersonFiles(
    category,
    subcategory
) {

    const sceneGroup =
        sceneGroups[category];

    return Object.keys(
        sceneGroup.categories
    ).map(
        (castCategory) => ({
            castCategory,
            filePath:
                path.join(
                    dataRoot,
                    sceneGroup.folder,
                    castCategory,
                    `${subcategory}.json`
                )
        })
    );

}

function getDefaultThreePersonFile(
    category,
    subcategory
) {

    return getThreePersonFiles(
        category,
        subcategory
    )[0].filePath;

}

function getEntries(
    pool,
    category,
    subcategory
) {

    if (
        pool === 'scene3'
    )
        return getThreePersonFiles(
            category,
            subcategory
        ).flatMap(
            ({
                castCategory,
                filePath
            }) =>
                readGifList(
                    filePath
                ).map(
                    (url, localIndex) => ({
                        castCategory,
                        filePath,
                        localIndex,
                        url
                    })
                )
        );

    const filePath =
        getFilePath(
            pool,
            category,
            subcategory
        );

    return readGifList(
        filePath
    ).map(
        (url, localIndex) => ({
            filePath,
            localIndex,
            url
        })
    );

}

function validateSelection(
    pool,
    category,
    subcategory,
    position
) {

    if (
        !poolLabels[pool]
    )
        return 'Select a valid pool.';

    if (
        !getCategoryChoices(
            pool
        ).includes(
            category
        )
    )
        return 'Select a valid category for that pool.';

    const subcategoryChoices =
        getSubcategoryChoices(
            pool,
            category
        );

    if (
        subcategoryChoices.length > 0 &&
        !subcategoryChoices.includes(
            subcategory
        )
    )
        return 'Select a valid subcategory for that pool.';

    if (
        subcategoryChoices.length === 0 &&
        subcategory
    )
        return 'This category does not use a subcategory.';

    if (
        !Number.isInteger(
            position
        ) ||
        position < 1
    )
        return 'Position must be 1 or higher.';

    return null;

}

function getCategoryLabel(
    pool,
    category
) {

    if (
        pool === 'scene2'
    )
        return getSceneCategoryLabel(
            sceneGroupForTwoPersonCategory(
                category
            ),
            category
        );

    if (
        pool === 'scene3'
    )
        return sceneGroups[category].label;

    return titleCase(
        category
    );

}

function buildState(
    pool,
    category,
    subcategory,
    position
) {

    return `${pool}:${category}:${safeSubcategory(
        subcategory
    )}:${position}`;

}

function buildInspectEmbed(
    {
        category,
        entry,
        pool,
        position,
        subcategory,
        total
    }
) {

    const embed =
        createEmbed({
            color:
                getRandomColor(),
            title:
                'GIF Admin Inspect',
            image:
                entry.url,
            footerText:
                commandFooter(
                    '/gifadmin inspect'
                ),
            timestamp:
                true
        });

    embed.addFields(
        {
            name:
                'Pool',
            value:
                poolLabels[pool],
            inline:
                true
        },
        {
            name:
                'Category',
            value:
                `${category} (${getCategoryLabel(
                    pool,
                    category
                )})`,
            inline:
                true
        },
        {
            name:
                'Subcategory',
            value:
                subcategory ?? 'None',
            inline:
                true
        },
        {
            name:
                'Position',
            value:
                String(
                    position
                ),
            inline:
                true
        },
        {
            name:
                'Total GIFs',
            value:
                String(
                    total
                ),
            inline:
                true
        }
    );

    if (
        entry.castCategory
    )
        embed.addFields(
            {
                name:
                    'Source Cast',
                value:
                    entry.castCategory,
                inline:
                    true
            }
        );

    return embed;

}

function buildInspectPayload(
    pool,
    category,
    subcategory,
    position,
    {
        actionDisabled = false,
        allDisabled = false,
        content = null
    } = {}
) {

    const entries =
        getEntries(
            pool,
            category,
            subcategory
        );

    if (
        entries.length === 0
    )
        return {
            content:
                'That pool has no GIFs.',
            embeds:
                [],
            components:
                []
        };

    const safePosition =
        Math.max(
            1,
            Math.min(
                position,
                entries.length
            )
        );

    return {
        content,
        embeds: [
            buildInspectEmbed({
                category,
                entry:
                    entries[safePosition - 1],
                pool,
                position:
                    safePosition,
                subcategory,
                total:
                    entries.length
            })
        ],
        components:
            buildInspectComponents(
                pool,
                category,
                subcategory,
                safePosition,
                entries.length,
                {
                    actionDisabled,
                    allDisabled
                }
            )
    };

}

function buildInspectComponents(
    pool,
    category,
    subcategory,
    position,
    total,
    {
        actionDisabled = false,
        allDisabled = false
    } = {}
) {

    const state =
        buildState(
            pool,
            category,
            subcategory,
            position
        );

    return [
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `gifadmin_prev:${state}`
                    )
                    .setLabel(
                        'Previous'
                    )
                    .setStyle(
                        ButtonStyle.Secondary
                    )
                    .setDisabled(
                        allDisabled ||
                        position <= 1
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        `gifadmin_next:${state}`
                    )
                    .setLabel(
                        'Next'
                    )
                    .setStyle(
                        ButtonStyle.Secondary
                    )
                    .setDisabled(
                        allDisabled ||
                        position >= total
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        `gifadmin_move:${state}`
                    )
                    .setLabel(
                        'Move'
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    )
                    .setDisabled(
                        allDisabled ||
                        actionDisabled
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        `gifadmin_delete:${state}`
                    )
                    .setLabel(
                        'Delete'
                    )
                    .setStyle(
                        ButtonStyle.Danger
                    )
                    .setDisabled(
                        allDisabled ||
                        actionDisabled
                    )
            )
    ];

}

function parseState(
    customId
) {

    const [
        action,
        pool,
        category,
        rawSubcategory,
        rawPosition,
        extra
    ] =
        customId.split(
            ':'
        );

    return {
        action,
        category,
        extra,
        pool,
        position:
            Number(
                rawPosition
            ),
        subcategory:
            parseSubcategory(
                rawSubcategory
            )
    };

}

function destinationFilePath(
    pool,
    category,
    subcategory
) {

    if (
        pool === 'scene3'
    )
        return getDefaultThreePersonFile(
            category,
            subcategory
        );

    return getFilePath(
        pool,
        category,
        subcategory
    );

}

function clearPoolCache(
    pool,
    category,
    subcategory,
    filePath
) {

    clearGifCache(
        filePath
    );

    if (
        pool !== 'interaction'
    )
        return;

    clearGifCache(
        category === 'horny'
            ? `horny/${subcategory}`
            : category
    );

}

async function logGifAdminAction(
    interaction,
    {
        action,
        destination,
        gifUrl,
        original
    }
) {

    await logBotEvent(
        interaction.client,
        {
            title:
                'GIF Admin Action',
            fields: [
                {
                    name:
                        'Staff Member',
                    value:
                        `${interaction.user} (${interaction.user.id})`,
                    inline:
                        false
                },
                {
                    name:
                        'Action',
                    value:
                        action,
                    inline:
                        true
                },
                {
                    name:
                        'Original Pool',
                    value:
                        poolLabels[original.pool],
                    inline:
                        true
                },
                {
                    name:
                        'Original Category',
                    value:
                        original.category,
                    inline:
                        true
                },
                {
                    name:
                        'Original Subcategory',
                    value:
                        original.subcategory ?? 'None',
                    inline:
                        true
                },
                {
                    name:
                        'Original Position',
                    value:
                        String(
                            original.position
                        ),
                    inline:
                        true
                },
                destination
                    ? {
                        name:
                            'Destination',
                        value:
                            `${destination.category} / ${destination.subcategory ?? 'None'}`,
                        inline:
                            true
                    }
                    : null,
                {
                    name:
                        'GIF URL',
                    value:
                        gifUrl,
                    inline:
                        false
                },
                {
                    name:
                        'Timestamp',
                    value:
                        new Date().toISOString(),
                    inline:
                        false
                }
            ].filter(
                Boolean
            )
        }
    );

}

async function executeInspect(
    interaction
) {

    if (
        await guardStaff(
            interaction
        )
    )
        return;

    const pool =
        interaction.options.getString(
            'pool',
            true
        );

    const category =
        interaction.options.getString(
            'category',
            true
        );

    const subcategory =
        interaction.options.getString(
            'subcategory'
        );

    const position =
        interaction.options.getInteger(
            'position',
            true
        );

    const validationError =
        validateSelection(
            pool,
            category,
            subcategory,
            position
        );

    if (
        validationError
    ) {

        await interaction.reply({
            content:
                validationError,
            flags:
                64
        });

        return;

    }

    const entries =
        getEntries(
            pool,
            category,
            subcategory
        );

    if (
        position > entries.length
    ) {

        await interaction.reply({
            content:
                `Position ${position} is outside this pool. Total GIFs: ${entries.length}.`,
            flags:
                64
        });

        return;

    }

    await interaction.reply({
        ...buildInspectPayload(
            pool,
            category,
            subcategory,
            position
        ),
        flags:
            64
    });

}

async function autocomplete(
    interaction
) {

    const focused =
        interaction.options.getFocused(
            true
        );

    const pool =
        interaction.options.getString(
            'pool'
        );

    const category =
        interaction.options.getString(
            'category'
        );

    const choices =
        focused.name === 'category'
            ? getCategoryChoices(
                pool
            )
            : getSubcategoryChoices(
                pool,
                category
            );

    await interaction.respond(
        choices
            .filter(
                (choice) =>
                    choice.includes(
                        focused.value.toLowerCase()
                    )
            )
            .slice(
                0,
                25
            )
            .map(
                (choice) => ({
                    name:
                        choice,
                    value:
                        choice
                })
            )
    );

}

async function handleNavigation(
    interaction
) {

    if (
        await guardStaff(
            interaction
        )
    )
        return;

    const state =
        parseState(
            interaction.customId
        );

    const nextPosition =
        state.action === 'gifadmin_prev'
            ? state.position - 1
            : state.position + 1;

    await interaction.update(
        buildInspectPayload(
            state.pool,
            state.category,
            state.subcategory,
            nextPosition
        )
    );

}

function buildDestinationCategoryMenu(
    state
) {

    return [
        new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(
                        `gifadmin_dest_cat:${buildState(
                            state.pool,
                            state.category,
                            state.subcategory,
                            state.position
                        )}`
                    )
                    .setPlaceholder(
                        'Destination category'
                    )
                    .addOptions(
                        getCategoryChoices(
                            state.pool
                        ).map(
                            (category) => ({
                                label:
                                    category,
                                value:
                                    category
                            })
                        )
                    )
            )
    ];

}

function buildDestinationSubcategoryMenu(
    state,
    destinationCategory
) {

    return [
        new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(
                        `gifadmin_dest_sub:${buildState(
                            state.pool,
                            state.category,
                            state.subcategory,
                            state.position
                        )}:${destinationCategory}`
                    )
                    .setPlaceholder(
                        'Destination subcategory'
                    )
                    .addOptions(
                        getSubcategoryChoices(
                            state.pool,
                            destinationCategory
                        ).map(
                            (subcategory) => ({
                                label:
                                    subcategory,
                                value:
                                    subcategory
                            })
                        )
                    )
            )
    ];

}

async function showMoveCategoryMenu(
    interaction
) {

    if (
        await guardStaff(
            interaction
        )
    )
        return;

    const state =
        parseState(
            interaction.customId
        );

    await interaction.update({
        ...buildInspectPayload(
            state.pool,
            state.category,
            state.subcategory,
            state.position
        ),
        content:
            'Select the destination category.',
        components:
            buildDestinationCategoryMenu(
                state
            )
    });

}

async function handleDestinationCategory(
    interaction
) {

    if (
        await guardStaff(
            interaction
        )
    )
        return;

    const state =
        parseState(
            interaction.customId
        );

    const destinationCategory =
        interaction.values[0];

    const subcategories =
        getSubcategoryChoices(
            state.pool,
            destinationCategory
        );

    if (
        subcategories.length === 0
    ) {

        await performMove(
            interaction,
            state,
            destinationCategory,
            null
        );

        return;

    }

    await interaction.update({
        ...buildInspectPayload(
            state.pool,
            state.category,
            state.subcategory,
            state.position
        ),
        content:
            'Select the destination subcategory.',
        components:
            buildDestinationSubcategoryMenu(
                state,
                destinationCategory
            )
    });

}

async function handleDestinationSubcategory(
    interaction
) {

    if (
        await guardStaff(
            interaction
        )
    )
        return;

    const state =
        parseState(
            interaction.customId
        );

    await performMove(
        interaction,
        state,
        state.extra,
        interaction.values[0]
    );

}

async function performMove(
    interaction,
    state,
    destinationCategory,
    destinationSubcategory
) {

    const entries =
        getEntries(
            state.pool,
            state.category,
            state.subcategory
        );

    const entry =
        entries[state.position - 1];

    if (
        !entry
    ) {

        await interaction.update({
            content:
                'That GIF position no longer exists.',
            embeds:
                [],
            components:
                []
        });

        return;

    }

    const sourceGifs =
        readGifList(
            entry.filePath
        );

    const [
        gifUrl
    ] =
        sourceGifs.splice(
            entry.localIndex,
            1
        );

    writeGifList(
        entry.filePath,
        sourceGifs
    );

    const destinationPath =
        destinationFilePath(
            state.pool,
            destinationCategory,
            destinationSubcategory
        );

    const destinationGifs =
        readGifList(
            destinationPath
        );

    destinationGifs.push(
        gifUrl
    );

    writeGifList(
        destinationPath,
        destinationGifs
    );

    clearPoolCache(
        state.pool,
        state.category,
        state.subcategory,
        entry.filePath
    );

    clearPoolCache(
        state.pool,
        destinationCategory,
        destinationSubcategory,
        destinationPath
    );

    await logGifAdminAction(
        interaction,
        {
            action:
                'Move',
            destination: {
                category:
                    destinationCategory,
                subcategory:
                    destinationSubcategory
            },
            gifUrl,
            original: {
                category:
                    state.category,
                pool:
                    state.pool,
                position:
                    state.position,
                subcategory:
                    state.subcategory
            }
        }
    );

    await interaction.update(
        buildInspectPayload(
            state.pool,
            destinationCategory,
            destinationSubcategory,
            getEntries(
                state.pool,
                destinationCategory,
                destinationSubcategory
            ).length,
            {
                actionDisabled:
                    true,
                content:
                    'GIF moved successfully.'
            }
        )
    );

}

async function showDeleteConfirmation(
    interaction
) {

    if (
        await guardStaff(
            interaction
        )
    )
        return;

    const state =
        parseState(
            interaction.customId
        );

    const currentPayload =
        buildInspectPayload(
            state.pool,
            state.category,
            state.subcategory,
            state.position
        );

    await interaction.update({
        ...currentPayload,
        content:
            'Confirm deleting this GIF.',
        components: [
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(
                            `gifadmin_delete_confirm:${buildState(
                                state.pool,
                                state.category,
                                state.subcategory,
                                state.position
                            )}`
                        )
                        .setLabel(
                            'Confirm Delete'
                        )
                        .setStyle(
                            ButtonStyle.Danger
                        ),
                    new ButtonBuilder()
                        .setCustomId(
                            `gifadmin_delete_cancel:${buildState(
                                state.pool,
                                state.category,
                                state.subcategory,
                                state.position
                            )}`
                        )
                        .setLabel(
                            'Cancel'
                        )
                        .setStyle(
                            ButtonStyle.Secondary
                        )
                )
        ]
    });

}

async function cancelDelete(
    interaction
) {

    if (
        await guardStaff(
            interaction
        )
    )
        return;

    const state =
        parseState(
            interaction.customId
        );

    await interaction.update(
        buildInspectPayload(
            state.pool,
            state.category,
            state.subcategory,
            state.position
        )
    );

}

async function confirmDelete(
    interaction
) {

    if (
        await guardStaff(
            interaction
        )
    )
        return;

    const state =
        parseState(
            interaction.customId
        );

    const entries =
        getEntries(
            state.pool,
            state.category,
            state.subcategory
        );

    const entry =
        entries[state.position - 1];

    if (
        !entry
    ) {

        await interaction.update({
            content:
                'That GIF position no longer exists.',
            embeds:
                [],
            components:
                []
        });

        return;

    }

    const sourceGifs =
        readGifList(
            entry.filePath
        );

    const [
        gifUrl
    ] =
        sourceGifs.splice(
            entry.localIndex,
            1
        );

    writeGifList(
        entry.filePath,
        sourceGifs
    );

    clearPoolCache(
        state.pool,
        state.category,
        state.subcategory,
        entry.filePath
    );

    await logGifAdminAction(
        interaction,
        {
            action:
                'Delete',
            gifUrl,
            original: {
                category:
                    state.category,
                pool:
                    state.pool,
                position:
                    state.position,
                subcategory:
                    state.subcategory
            }
        }
    );

    const deletedEmbed =
        buildInspectEmbed({
            category:
                state.category,
            entry,
            pool:
                state.pool,
            position:
                state.position,
            subcategory:
                state.subcategory,
            total:
                entries.length
        });

    await interaction.update({
        content:
            'GIF deleted successfully.',
        embeds: [
            deletedEmbed
        ],
        components:
            buildInspectComponents(
                state.pool,
                state.category,
                state.subcategory,
                state.position,
                entries.length,
                {
                    allDisabled:
                        true
                }
            )
    });

}

module.exports = {
    autocomplete,
    executeInspect,
    handleDestinationCategory,
    handleDestinationSubcategory,
    handleNavigation,
    showDeleteConfirmation,
    showMoveCategoryMenu,
    cancelDelete,
    confirmDelete
};
