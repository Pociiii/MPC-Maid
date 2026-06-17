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

module.exports = {

    async execute(
        interaction
    ) {

        const [

            ,
            category,
            submitterId

        ] =
            interaction.customId.split(
                ':'
            );

        //
        // Scene categories
        //
        const sceneCategories = [

            'wm_wf',
            'wm_bf',
            'bm_wf',
            'bm_bf',
            'wf_wf',
            'wf_bf',
            'bf_bf'

        ];

        if (
            sceneCategories.includes(
                category
            )
        ) {
            const sceneFolder =
                path.join(
                    __dirname,
                    '..',
                    '..',
                    'data',
                    'scenes',
                    category
                );

            const foreplayCount =
                getGifCount(
                    path.join(
                        sceneFolder,
                        'foreplay.json'
                    )
                );

            const oralCount =
                getGifCount(
                    path.join(
                        sceneFolder,
                        'oral.json'
                    )
                );

            const sexCount =
                getGifCount(
                    path.join(
                        sceneFolder,
                        'sex.json'
                    )
                );

            const finaleCount =
                getGifCount(
                    path.join(
                        sceneFolder,
                        'finale.json'
                    )
                );
            const menu =
                new StringSelectMenuBuilder()

                    .setCustomId(

                        `gif_scene_type:${category}:${submitterId}`

                    )

                    .setPlaceholder(
                        'Select scene type'
                    )

                    .addOptions(

                        {
                            label: `Foreplay (${foreplayCount})`,

                            value: 'foreplay'
                        },

                        {
                            label: `Oral (${oralCount})`,

                            value:
                                'oral'
                        },

                        {
                            label: `Sex (${sexCount})`,

                            value:
                                'sex'
                        },

                        {
                            label: `Finale (${finaleCount})`,

                            value:
                                'finale'
                        }

                    );

            const row =
                new ActionRowBuilder()

                    .addComponents(
                        menu
                    );

            return interaction.update({

                content:
                    'Select scene type:',

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