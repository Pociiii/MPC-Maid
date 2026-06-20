const {

    ActionRowBuilder,
    StringSelectMenuBuilder

} = require(
    'discord.js'
);

const path =
    require('path');

const {
    getGifCount
} = require(
    '../../utils/gifs'
);

const {
    approveGif
} = require(
    '../../utils/gifApproval'
);

const {
    getSceneCategoryName,
    getSceneGroup,
    getSceneGroupKey,
    sceneGroups
} = require(
    '../../data/sceneSubmitGroups'
);

module.exports = {

    async execute(
        interaction
    ) {

        const parts =
            interaction.customId.split(
                ':'
            );

        const hasSceneGroup =
            parts.length >= 4 &&
            Boolean(
                sceneGroups[parts[1]]
            );

        const group =
            hasSceneGroup
                ? getSceneGroupKey(
                    parts[1]
                )
                : 'mf';

        const category =
            hasSceneGroup
                ? parts[2]
                : parts[1];

        const submitterId =
            hasSceneGroup
                ? parts[3]
                : parts[2];

        //
        // Scene categories
        //
        const sceneGroup =
            getSceneGroup(
                group
            );

        if (
            sceneGroup.categories[category]
        ) {
            const sceneFolder =
                path.join(
                    __dirname,
                    '..',
                    '..',
                    'data',
                    sceneGroup.folder,
                    category
                );

            const menu =
                new StringSelectMenuBuilder()

                    .setCustomId(

                        `gif_scene_type:${group}:${category}:${submitterId}`

                    )

                    .setPlaceholder(
                        'Select scene type'
                    )

                    .addOptions(
                        ...sceneGroup.types.map(
                            (sceneType) => ({
                                label:
                                    `${sceneType.charAt(0).toUpperCase()}${sceneType.slice(1)} (${getGifCount(
                                        path.join(
                                            sceneFolder,
                                            `${sceneType}.json`
                                        )
                                    )})`,
                                value:
                                    sceneType
                            })
                        )
                    );

            const row =
                new ActionRowBuilder()

                    .addComponents(
                        menu
                    );

            return interaction.update({

                content:
                    `Select ${getSceneCategoryName(
                        group,
                        category
                    )} type:`,

                embeds:
                    interaction.message.embeds,

                components: [row]

            });

        }

        //
        // Flex
        //
        if (
            category === 'flex'
        ) {
            const flexWCount =
                getGifCount(
                    path.join(
                        __dirname,
                        '..',
                        '..',
                        'data',
                        'gifs',
                        'flex_w.json'
                    )
                );

            const flexBCount =
                getGifCount(
                    path.join(
                        __dirname,
                        '..',
                        '..',
                        'data',
                        'gifs',
                        'flex_b.json'
                    )
                );
            const menu =
                new StringSelectMenuBuilder()

                    .setCustomId(

                        `gif_flex_type:${submitterId}`

                    )

                    .setPlaceholder(
                        'Select flex type'
                    )

                    .addOptions(

                        {
                            label: `White Male (${flexWCount})`,

                            value:
                                'flex_w'
                        },

                        {
                            label: `Black Male (${flexBCount})`,

                            value:
                                'flex_b'
                        }

                    );

            const row =
            new ActionRowBuilder()

                .addComponents(
                    menu
                );

            return interaction.update({

                content:
                    'Select flex type:',

                embeds:
                    interaction.message.embeds,

                components: [row]

            });

        }

        //
        // Horny
        //
        if (
            category === 'horny'
        ) {
            const hornyFolder =
                path.join(
                    __dirname,
                    '..',
                    '..',
                    'data',
                    'gifs',
                    'horny'
                );

            const wmCount =
                getGifCount(
                    path.join(
                        hornyFolder,
                        'wm.json'
                    )
                );

            const bmCount =
                getGifCount(
                    path.join(
                        hornyFolder,
                        'bm.json'
                    )
                );

            const wfCount =
                getGifCount(
                    path.join(
                        hornyFolder,
                        'wf.json'
                    )
                );

            const bfCount =
                getGifCount(
                    path.join(
                        hornyFolder,
                        'bf.json'
                    )
                );
            const menu =
                new StringSelectMenuBuilder()

                    .setCustomId(

                        `gif_horny_type:${submitterId}`

                    )

                    .setPlaceholder(
                        'Select horny type'
                    )

                    .addOptions(

                        {
                            label: `WM (${wmCount})`,

                            value:
                                'wm'
                        },

                        {
                            label: `BM (${bmCount})`,

                            value:
                                'bm'
                        },

                        {
                            label: `WF (${wfCount})`,

                            value:
                                'wf'
                        },

                        {
                            label: `BF (${bfCount})`,

                            value:
                                'bf'
                        }

                    );
            
            const row =
                new ActionRowBuilder()

                    .addComponents(
                        menu
                    );

            return interaction.update({

                content:
                    'Select horny type:',

                components: [row],
                
                embeds:
                    interaction.message.embeds,


            });

        }

        //
        // Direct-save categories
        //

        

        const filePath =
            path.join(

                __dirname,

                '..',
                '..',

                'data',
                'gifs',

                `${category}.json`

            );

        return approveGif(
            interaction,
            filePath,
            category
        );

    }

};
