const fs = require('fs');
const path = require('path');

const {
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');

const { createEmbed } = require('../../utils/embeds');
const { getRandomColor } = require('../../data/constants');
const { getGifCount } = require('../../utils/gifs');
const {
    castSymbol,
    sceneGroups
} = require('../../data/sceneSubmitGroups');

const dataFolder = path.join(__dirname, '..', '..', 'data');

const interactionLabels = {
    blowkiss: 'Blow Kiss',
    brofist: 'Brofist',
    spank: 'Spank',
    titty_drop: 'Drop',
    wiggle: 'Wiggle'
};

function titleCase(value) {
    return value
        .replace(/\.json$/, '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function fileCountLine(label, filePath) {
    return `- ${label} (${getGifCount(filePath)})`;
}

function buildInteractionLines() {
    const gifsFolder = path.join(dataFolder, 'gifs');

    const directFiles = fs.readdirSync(gifsFolder, { withFileTypes: true })
        .filter((entry) =>
            entry.isFile() &&
            entry.name.endsWith('.json') &&
            !entry.name.startsWith('flex_')
        )
        .map((entry) => {
            const category = entry.name.replace(/\.json$/, '');

            return fileCountLine(
                interactionLabels[category] ?? titleCase(category),
                path.join(gifsFolder, entry.name)
            );
        })
        .sort();

    const flexLines = [
        fileCountLine(castSymbol.wm, path.join(gifsFolder, 'flex_w.json')),
        fileCountLine(castSymbol.bm, path.join(gifsFolder, 'flex_b.json'))
    ];

    const hornyFolder = path.join(gifsFolder, 'horny');

    const hornyLines = fs.readdirSync(hornyFolder, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
        .map((entry) =>
            fileCountLine(
                castSymbol[entry.name.replace(/\.json$/, '')] ??
                entry.name.replace(/\.json$/, '').toUpperCase(),
                path.join(hornyFolder, entry.name)
            )
        )
        .sort();

    return [
        ...directFiles,
        '- Flex',
        ...flexLines.map((line) => `  ${line}`),
        '- Horny',
        ...hornyLines.map((line) => `  ${line}`)
    ];
}

function buildSceneLines(group) {
    const scenesFolder = path.join(dataFolder, group.folder);

    return Object.entries(group.categories)
        .map(([category, label]) => {
            const categoryFolder = path.join(scenesFolder, category);

            if (!fs.existsSync(categoryFolder)) {
                return {
                    name: label,
                    value: group.types
                        .map((sceneType) => `- ${titleCase(sceneType)} (0)`)
                        .join('\n')
                };
            }

            const subcategories = fs.readdirSync(categoryFolder, { withFileTypes: true })
                .filter((subEntry) => subEntry.isFile() && subEntry.name.endsWith('.json'))
                .map((subEntry) =>
                    fileCountLine(
                        titleCase(subEntry.name),
                        path.join(categoryFolder, subEntry.name)
                    )
                )
                .sort();

            return {
                name: label,
                value: subcategories.join('\n')
            };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
}

function buildInfoMenu(activeView) {
    const options = [
        {
            label: 'Interactions',
            value: 'interactions'
        },
        ...Object.entries(sceneGroups).map(([key, group]) => ({
            label: group.label,
            value: key
        }))
    ];

    return new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('gif_info_select')
                .setPlaceholder('Choose GIF info group')
                .addOptions(
                    ...options.map((option) => ({
                        ...option,
                        default: option.value === activeView
                    }))
                )
        );
}

function buildGifInfoReply(view = 'interactions') {
    const safeView =
        view === 'interactions' || sceneGroups[view]
            ? view
            : 'interactions';

    const embed = createEmbed({
        color: getRandomColor(),
        title:
            safeView === 'interactions'
                ? 'GIF Data Info - Interactions'
                : `GIF Data Info - ${sceneGroups[safeView].label}`,
        description: 'Current GIF counts.',
        timestamp: true
    });

    if (safeView === 'interactions') {
        embed.addFields({
            name: 'Interactions',
            value: buildInteractionLines().join('\n')
        });
    }
    else {
        embed.addFields(
            ...buildSceneLines(sceneGroups[safeView]).map((field) => ({
                name: field.name,
                value: field.value,
                inline: true
            }))
        );
    }

    return {
        embeds: [embed],
        components: [buildInfoMenu(safeView)]
    };
}

module.exports = {
    customId: 'gifsubmit_info',
    buildGifInfoReply,

    async execute(interaction) {
        await interaction.reply({
            ...buildGifInfoReply(),
            flags: 64
        });
    }
};
