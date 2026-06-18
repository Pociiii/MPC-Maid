const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require('discord.js');

module.exports = {

    async execute(interaction) {

        const modal =
            new ModalBuilder()

                .setCustomId(
                    interaction.customId.replace(
                        'gifreject',
                        'gifrejectmodal'
                    )
                )

                .setTitle(
                    'Reject GIF Submission'
                );

        const reason =
            new TextInputBuilder()

                .setCustomId(
                    'reason'
                )

                .setLabel(
                    'Reason'
                )

                .setStyle(
                    TextInputStyle.Paragraph
                )

                .setRequired(true)

                .setPlaceholder(
                    'Duplicate, wrong category, low quality...'
                );

        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(reason)

        );

        await interaction.showModal(
            modal
        );

    }

};