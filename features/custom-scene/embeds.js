const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    createUserEmbed
} = require('../../utils/embeds');

const {
    castLabels,
    createCustomId,
    customScenePartCost,
    getCustomSceneCost,
    maxParts,
    phaseLabels,
    phaseValues
} = require('./state');

const phaseEmojis = {
    foreplay:
        '\u2728',
    oral:
        '\uD83D\uDC8B',
    sex:
        '\uD83D\uDD25',
    finale:
        '\uD83C\uDFC1'
};

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
                `- ${index + 1}. ${phaseLabels[part]}`
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

    const cost =
        getCustomSceneCost(
            parts
        );

    return createUserEmbed(
        interaction,
        {
            command:
                '/customscene',
            footerDetail:
                'Add up to 8 parts, then press Finish.',
            title:
                'Custom Scene Builder',
            description:
`- Cast: **${castLabels[cast] ?? cast}**
- Parts: **${parts.length}/${maxParts}**
- Cost: **${cost} coins** (${customScenePartCost} per part)

${formatParts(parts)}`
        }
    );

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
                    .setEmoji(
                        phaseEmojis[phase]
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
            .setEmoji(
                '\u21A9\uFE0F'
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
            .setEmoji(
                '\u2705'
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

module.exports = {
    buildBuilderEmbed,
    buildBuilderRows
};
