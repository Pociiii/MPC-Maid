const {
    SlashCommandBuilder
} = require('discord.js');

const {
    buildTrainingPanel
} = require('../../features/porn-career/training');

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'train'
            )
            .setDescription(
                'Open your porn career training panel'
            ),

    async execute(
        interaction
    ) {

        await interaction.deferReply({
            flags:
                64
        });

        await interaction.editReply(
            await buildTrainingPanel(
                interaction
            )
        );

    }

};
