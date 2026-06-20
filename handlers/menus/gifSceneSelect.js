const {

    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder

} = require(
    'discord.js'
);

module.exports = {

    customId:
        'gif_scene_select',

    async execute(
        interaction
    ) {

        const group =
            interaction.customId.split(
                ':'
            )[1] ?? 'mf';

        const category =
            interaction.values[0];

        const modal =
            new ModalBuilder()

                .setCustomId(
                    `gif_submit:${group}:${category}`
                )

                .setTitle(
                    'GIF Submission'
                );

        const gifInput =
            new TextInputBuilder()

                .setCustomId(
                    'gif_url'
                )

                .setLabel(
                    'GIF URL'
                )

                .setStyle(
                    TextInputStyle.Short
                )

                .setRequired(true)

                .setPlaceholder(
                    'https://...'
                );

        modal.addComponents(

            new ActionRowBuilder()

                .addComponents(
                    gifInput
                )

        );

        await interaction.showModal(
            modal
        );

    }

};
