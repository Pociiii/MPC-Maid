const fs =
    require('fs');

const path =
    require('path');

const {

    createEmbed

} = require(
    '../../utils/embeds'
);

const {

    getRandomColor

} = require(
    '../../data/constants'
);

const {

    getGifCount

} = require(
    '../../utils/gifs'
);

const dataFolder =
    path.join(
        __dirname,
        '..',
        '..',
        'data'
    );

const sceneLabels = {

    wm_wf: 'WM / WF',
    wm_bf: 'WM / BF',
    bm_wf: 'BM / WF',
    bm_bf: 'BM / BF',
    wf_wf: 'WF / WF',
    wf_bf: 'WF / BF',
    bf_bf: 'BF / BF'

};

const interactionLabels = {

    blowkiss: 'Blow Kiss',
    spank: 'Spank',
    titty_drop: 'Drop',
    wiggle: 'Wiggle'

};

function titleCase(
    value
) {

    return value
        .replace(
            /\.json$/,
            ''
        )
        .replace(
            /_/g,
            ' '
        )
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase()
        );

}

function fileCountLine(
    label,
    filePath
) {

    return `- ${label} (${getGifCount(filePath)})`;

}

function buildInteractionLines() {

    const gifsFolder =
        path.join(
            dataFolder,
            'gifs'
        );

    const directFiles =
        fs.readdirSync(
            gifsFolder,
            {
                withFileTypes: true
            }
        )
            .filter(
                (entry) =>
                    entry.isFile()
                    && entry.name.endsWith(
                        '.json'
                    )
                    && !entry.name.startsWith(
                        'flex_'
                    )
            )
            .map(
                (entry) => {

                    const category =
                        entry.name.replace(
                            /\.json$/,
                            ''
                        );

                    return fileCountLine(
                        interactionLabels[category]
                            ?? titleCase(category),
                        path.join(
                            gifsFolder,
                            entry.name
                        )
                    );

                }
            )
            .sort();

    const flexLines = [

        fileCountLine(
            'White Male',
            path.join(
                gifsFolder,
                'flex_w.json'
            )
        ),

        fileCountLine(
            'Black Male',
            path.join(
                gifsFolder,
                'flex_b.json'
            )
        )

    ];

    const hornyFolder =
        path.join(
            gifsFolder,
            'horny'
        );

    const hornyLines =
        fs.readdirSync(
            hornyFolder,
            {
                withFileTypes: true
            }
        )
            .filter(
                (entry) =>
                    entry.isFile()
                    && entry.name.endsWith(
                        '.json'
                    )
            )
            .map(
                (entry) =>
                    fileCountLine(
                        entry.name
                            .replace(
                                /\.json$/,
                                ''
                            )
                            .toUpperCase(),
                        path.join(
                            hornyFolder,
                            entry.name
                        )
                    )
            )
            .sort();

    return [

        ...directFiles,
        '- Flex',
        ...flexLines.map(
            (line) =>
                `  ${line}`
        ),
        '- Horny',
        ...hornyLines.map(
            (line) =>
                `  ${line}`
        )

    ];

}

function buildSceneLines() {

    const scenesFolder =
        path.join(
            dataFolder,
            'scenes'
        );

    return fs.readdirSync(
        scenesFolder,
        {
            withFileTypes: true
        }
    )
        .filter(
            (entry) =>
                entry.isDirectory()
        )
        .map(
            (entry) => {

                const categoryFolder =
                    path.join(
                        scenesFolder,
                        entry.name
                    );

                const subcategories =
                    fs.readdirSync(
                        categoryFolder,
                        {
                            withFileTypes: true
                        }
                    )
                        .filter(
                            (subEntry) =>
                                subEntry.isFile()
                                && subEntry.name.endsWith(
                                    '.json'
                                )
                        )
                        .map(
                            (subEntry) =>
                                fileCountLine(
                                    titleCase(
                                        subEntry.name
                                    ),
                                    path.join(
                                        categoryFolder,
                                        subEntry.name
                                    )
                                )
                        )
                        .sort();

                return {

                    name:
                        sceneLabels[entry.name] ?? entry.name,

                    value:
                        subcategories.join(
                            '\n'
                        )

                };

            }
        )
        .sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );

}

module.exports = {

    customId:
        'gifsubmit_info',

    async execute(
        interaction
    ) {

        const interactionLines =
            buildInteractionLines();

        const sceneFields =
            buildSceneLines();

        const embed =
            createEmbed({

                color:
                    getRandomColor(),

                title:
                    'GIF Data Info',

                description:
                    'Current GIF counts by category and subcategory.',

                timestamp:
                    true

            });

        embed.addFields(

            {
                name:
                    'Interactions',

                value:
                    interactionLines.join(
                        '\n'
                    )
            },

            ...sceneFields.map(
                (field) => ({

                    name:
                        field.name,

                    value:
                        field.value,

                    inline:
                        true

                })
            )

        );

        await interaction.reply({

            embeds: [embed],

            flags: 64

        });

    }

};
