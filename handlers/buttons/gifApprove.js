const {

    ActionRowBuilder,
    StringSelectMenuBuilder

} = require(
    'discord.js'
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
                            label:
                                'Foreplay',

                            value:
                                'foreplay'
                        },

                        {
                            label:
                                'Oral',

                            value:
                                'oral'
                        },

                        {
                            label:
                                'Sex',

                            value:
                                'sex'
                        },

                        {
                            label:
                                'Finale',

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
                            label:
                                'White Male',

                            value:
                                'flex_w'
                        },

                        {
                            label:
                                'Black Male',

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
                            label:
                                'WM',

                            value:
                                'wm'
                        },

                        {
                            label:
                                'BM',

                            value:
                                'bm'
                        },

                        {
                            label:
                                'WF',

                            value:
                                'wf'
                        },

                        {
                            label:
                                'BF',

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
        return interaction.update({

            content:
                `TODO: Save directly to ${category}`,

            embeds:
                interaction.message.embeds,

            components: []

        });

    }

};