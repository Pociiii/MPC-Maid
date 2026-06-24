const {
    SlashCommandBuilder
} = require('discord.js');

const {
    startBreedRequest
} = require('../../features/pregnancy/pregnancyRequest');

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'breed'
            )
            .setDescription(
                'Send a pregnancy RP request'
            )
            .addUserOption(
                (option) =>
                    option
                        .setName(
                            'partner'
                        )
                        .setDescription(
                            'The user you want to breed with'
                        )
                        .setRequired(
                            true
                        )
            ),

    async execute(
        interaction
    ) {

        const target =
            interaction.options.getUser(
                'partner'
            );

        if (
            target.bot
        ) {

            await interaction.reply({
                content:
                    'You cannot breed with a bot.',
                flags:
                    64
            });

            return;

        }

        if (
            target.id === interaction.user.id
        ) {

            await interaction.reply({
                content:
                    'You cannot breed with yourself.',
                flags:
                    64
            });

            return;

        }

        await interaction.deferReply({
            flags:
                64
        });

        await startBreedRequest(
            interaction,
            target
        );

    }

};
