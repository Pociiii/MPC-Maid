const {
    SlashCommandBuilder
} = require('discord.js');

const {
    buildCommandGuideComponents,
    buildCommandOverviewEmbed
} = require('../../features/commands/commandGuide');

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'commands'
            )
            .setDescription(
                'Post the MPC Maid command guide'
            ),

    async execute(
        interaction
    ) {

        await interaction.deferReply({
            flags:
                64
        });

        const channel =
            interaction.channel;

        if (
            !channel?.send
        ) {

            await interaction.editReply({
                content:
                    'I could not post the command guide in this channel.'
            });

            return;

        }

        const message =
            await channel.send({
                embeds: [
                    buildCommandOverviewEmbed(
                        interaction
                    )
                ],
                components:
                    buildCommandGuideComponents()
            });

        await interaction.editReply({
            content:
                `Command guide posted here: ${message.url}`
        });

    }

};
