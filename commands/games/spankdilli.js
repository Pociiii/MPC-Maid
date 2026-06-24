const {
    PermissionsBitField,
    SlashCommandBuilder
} = require('discord.js');

const {
    buildPanelEmbed,
    getButtonRow,
    getPanelOwner,
    getState
} = require('../../features/casino/spankDilli');

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'spankdilli'
            )
            .setDescription(
                'Post the Spank Dilli casino panel'
            )
            .setDefaultMemberPermissions(
                PermissionsBitField.Flags.Administrator
            ),

    async execute(
        interaction
    ) {

        await interaction.deferReply({
            flags:
                64
        });

        const state =
            await getState();

        const owner =
            await getPanelOwner(
                interaction
            );

        const message =
            await interaction.channel.send({
            embeds: [
                buildPanelEmbed(
                    state,
                    owner
                )
            ],
            components: [
                getButtonRow()
            ]
        });

        await interaction.editReply({
            content:
                `Spank Dilli panel posted: ${message.url}`
        });

    }

};
