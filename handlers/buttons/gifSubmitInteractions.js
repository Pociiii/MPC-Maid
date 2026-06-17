const {

    ActionRowBuilder,
    StringSelectMenuBuilder

} = require(
    'discord.js'
);

module.exports = {

    customId:
        'gifsubmit_interactions',

    async execute(
        interaction
    ) {

        const menu =
            new StringSelectMenuBuilder()

                .setCustomId(
                    'gif_interaction_select'
                )

                .setPlaceholder(
                    'Select interaction category'
                )

                .addOptions(

                    {
                        label:
                            'Wiggle',

                        value:
                            'wiggle'
                    },

                    {
                        label:
                            'Drop',

                        value:
                            'titty_drop'
                    },

                    {
                        label:
                            'Spank',

                        value:
                            'spank'
                    },

                    {
                        label:
                            'Blow Kiss',

                        value:
                            'blowkiss'
                    },

                    {
                        label:
                            'Flex',

                        value:
                            'flex'
                    },

                    {
                        label:
                            'Horny',

                        value:
                            'horny'
                    }

                );

        const row =
            new ActionRowBuilder()

                .addComponents(
                    menu
                );

        await interaction.reply({

            content:
                'Select the interaction category:',

            components: [row],

            flags: 64

        });

    }

};