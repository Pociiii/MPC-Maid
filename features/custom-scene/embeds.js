const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    getRandomColor
} = require('../../data/constants');

const {
    castLabels,
    createCustomId,
    maxParts,
    phaseLabels,
    phaseValues
} = require('./state');

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

module.exports = {
    buildBuilderEmbed,
    buildBuilderRows
};
