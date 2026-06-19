const {

    ActionRowBuilder,
    StringSelectMenuBuilder

} = require(
    'discord.js'
);

module.exports = {

    customId:
        'gifsubmit_scenes',

    async execute(
        interaction
    ) {

        const menu =
            new StringSelectMenuBuilder()

                .setCustomId(
                    'gif_scene_select'
                )

                .setPlaceholder(
                    'Select scene category'
                )

                .addOptions(

                    {
                        label:
                            '⚪White Male ⚪White Female',

                        value:
                            'wm_wf'
                    },

                    {
                        label:
                            '⚪White Male ⚫Black Female',

                        value:
                            'wm_bf'
                    },

                    {
                        label:
                            '⚫Black Male ⚪White Female',

                        value:
                            'bm_wf'
                    },

                    {
                        label:
                            '⚫Black Male ⚫Black Female',

                        value:
                            'bm_bf'
                    },

                    {
                        label:
                            '⚪White Female ⚪White Female',

                        value:
                            'wf_wf'
                    },

                    {
                        label:
                            '⚪White Female ⚫Black Female',

                        value:
                            'wf_bf'
                    },

                    {
                        label:
                            '⚫Black Female ⚫Black Female',

                        value:
                            'bf_bf'
                    }

                );

        const row =
            new ActionRowBuilder()

                .addComponents(
                    menu
                );

        await interaction.reply({

            content:
                'Select the scene category:',

            components: [row],

            flags: 64

        });

    }

};
