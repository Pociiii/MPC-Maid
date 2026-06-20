const fs =
    require('fs');

const path =
    require('path');

const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    CHANNELS,
    getRandomColor
} = require('../../data/constants');

const {
    getSceneCategoryLabel
} = require('../../data/sceneSubmitGroups');

const maxParts = 8;

const sceneDurationMs =
    30 * 60 * 1000;

const sceneRoot =
    path.join(
        __dirname,
        '..',
        '..',
        'data',
        'scenes'
    );

const castLabels = {
    wm_wf: getSceneCategoryLabel('mf', 'wm_wf'),
    wm_bf: getSceneCategoryLabel('mf', 'wm_bf'),
    bm_wf: getSceneCategoryLabel('mf', 'bm_wf'),
    bm_bf: getSceneCategoryLabel('mf', 'bm_bf'),
    wf_wf: getSceneCategoryLabel('mf', 'wf_wf'),
    wf_bf: getSceneCategoryLabel('mf', 'wf_bf'),
    bf_bf: getSceneCategoryLabel('mf', 'bf_bf')
};

const phaseLabels = {
    foreplay: 'Foreplay',
    oral: 'Oral',
    sex: 'Sex',
    finale: 'Finale'
};

const phaseCodes = {
    foreplay: 'f',
    oral: 'o',
    sex: 's',
    finale: 'e'
};

const codePhases = {
    f: 'foreplay',
    o: 'oral',
    s: 'sex',
    e: 'finale'
};

const phaseValues =
    Object.keys(
        phaseLabels
    );

function encodeParts(
    parts
) {

    return parts
        .map(
            (part) =>
                phaseCodes[part]
        )
        .join(
            ''
        );

}

function decodeParts(
    value
) {

    if (!value)
        return [];

    return value
        .split(
            ''
        )
        .map(
            (code) =>
                codePhases[code]
        )
        .filter(
            Boolean
        );

}

function createCustomId(
    action,
    userId,
    cast,
    parts
) {

    return `customscene_${action}:${userId}:${cast}:${encodeParts(parts)}`;

}

function formatParts(
    parts
) {

    if (
        parts.length === 0
    )
        return 'No parts selected yet.';

    return parts
        .map(
            (part, index) =>
                `${index + 1}. ${phaseLabels[part]}`
        )
        .join(
            '\n'
        );

}

function buildBuilderEmbed(
    interaction,
    cast,
    parts
) {

    return createEmbed({
        color:
            getRandomColor(),
        title:
            'Custom Scene Builder',
        thumbnail:
            interaction.user.displayAvatarURL(),
        description:
`Cast: **${castLabels[cast] ?? cast}**
Parts: **${parts.length}/${maxParts}**

${formatParts(parts)}`,
        footerText:
            '/customscene - Add up to 8 parts, then press Finish.',
        timestamp:
            true
    });

}

function buildBuilderRows(
    userId,
    cast,
    parts,
    disabled = false
) {

    const partButtons =
        phaseValues.map(
            (phase) =>
                new ButtonBuilder()
                    .setCustomId(
                        createCustomId(
                            'part',
                            userId,
                            cast,
                            [
                                ...parts,
                                phase
                            ]
                        )
                    )
                    .setLabel(
                        phaseLabels[phase]
                    )
                    .setStyle(
                        ButtonStyle.Secondary
                    )
                    .setDisabled(
                        disabled ||
                        parts.length >= maxParts
                    )
        );

    const undoButton =
        new ButtonBuilder()
            .setCustomId(
                createCustomId(
                    'undo',
                    userId,
                    cast,
                    parts.slice(
                        0,
                        -1
                    )
                )
            )
            .setLabel(
                'Undo'
            )
            .setStyle(
                ButtonStyle.Danger
            )
            .setDisabled(
                disabled ||
                parts.length === 0
            );

    const finishButton =
        new ButtonBuilder()
            .setCustomId(
                createCustomId(
                    'finish',
                    userId,
                    cast,
                    parts
                )
            )
            .setLabel(
                'Finish'
            )
            .setStyle(
                ButtonStyle.Success
            )
            .setDisabled(
                disabled ||
                parts.length === 0
            );

    return [
        new ActionRowBuilder()
            .addComponents(
                partButtons
            ),
        new ActionRowBuilder()
            .addComponents(
                undoButton,
                finishButton
            )
    ];

}

function getRandomSceneGif(
    cast,
    phase
) {

    const filePath =
        path.join(
            sceneRoot,
            cast,
            `${phase}.json`
        );

    const gifs =
        JSON.parse(
            fs.readFileSync(
                filePath,
                'utf8'
            )
        );

    const index =
        Math.floor(
            Math.random() * gifs.length
        );

    return {
        url:
            gifs[index],
        index:
            index + 1,
        total:
            gifs.length
    };

}

function buildSceneEmbed(
    interaction,
    cast,
    part,
    index,
    totalParts
) {

    const gif =
        getRandomSceneGif(
            cast,
            part
        );

    return createEmbed({
        color:
            getRandomColor(),
        title:
            `Part ${index + 1}`,
        thumbnail:
            interaction.user.displayAvatarURL(),
        description:
            `Custom scene from <@${interaction.user.id}>`,
        image:
            gif.url,
        footerText:
            `/customscene - Part ${index + 1}/${totalParts} - GIF #${gif.index}/${gif.total}`,
        timestamp:
            index === totalParts - 1
    });

}

function getPartIntervalMs(
    totalParts
) {

    if (
        totalParts <= 1
    )
        return 0;

    return Math.floor(
        sceneDurationMs / (totalParts - 1)
    );

}

function scheduleCustomScene(
    channel,
    interaction,
    cast,
    parts
) {

    const intervalMs =
        getPartIntervalMs(
            parts.length
        );

    parts.forEach(
        (part, index) => {

            setTimeout(
                async () => {

                    try {

                        await channel.send({
                            embeds: [
                                buildSceneEmbed(
                                    interaction,
                                    cast,
                                    part,
                                    index,
                                    parts.length
                                )
                            ]
                        });

                    }
                    catch (error) {

                        console.error(
                            'CUSTOM SCENE ERROR'
                        );
                        console.error(
                            error
                        );

                    }

                },
                index * intervalMs
            );

        }
    );

}

async function guardOwner(
    interaction,
    ownerId
) {

    if (
        interaction.user.id === ownerId
    )
        return false;

    await interaction.reply({
        content:
            'Only the user building this custom scene can use these buttons.',
        flags: 64
    });

    return true;

}

module.exports = {

    async execute(
        interaction
    ) {

        const [
            action,
            ownerId,
            cast,
            rawParts = ''
        ] =
            interaction.customId.split(
                ':'
            );

        if (
            await guardOwner(
                interaction,
                ownerId
            )
        )
            return;

        const parts =
            decodeParts(
                rawParts
            );

        if (
            action === 'customscene_cast' ||
            action === 'customscene_part' ||
            action === 'customscene_undo'
        ) {

            await interaction.update({
                embeds: [
                    buildBuilderEmbed(
                        interaction,
                        cast,
                        parts
                    )
                ],
                components:
                    buildBuilderRows(
                        ownerId,
                        cast,
                        parts
                    )
            });

            return;

        }

        if (
            action !== 'customscene_finish'
        )
            return;

        if (
            parts.length === 0
        ) {

            await interaction.reply({
                content:
                    'Pick at least one scene part before finishing.',
                flags: 64
            });

            return;

        }

        const channel =
            interaction.client.channels.cache.get(
                CHANNELS.CUSTOM_SCENE
            ) ??
            await interaction.client.channels.fetch(
                CHANNELS.CUSTOM_SCENE
            );

        if (
            !channel
        ) {

            await interaction.reply({
                content:
                    'I could not find the custom-scene channel.',
                flags: 64
            });

            return;

        }

        scheduleCustomScene(
            channel,
            interaction,
            cast,
            parts
        );

        const finalEmbed =
            buildBuilderEmbed(
                interaction,
                cast,
                parts
            );

        finalEmbed.setDescription(
`${finalEmbed.data.description}

Posting in <#${CHANNELS.CUSTOM_SCENE}> across 30 minutes.`
        );

        await interaction.update({
            embeds: [finalEmbed],
            components:
                buildBuilderRows(
                    ownerId,
                    cast,
                    parts,
                    true
                )
        });

    }

};
