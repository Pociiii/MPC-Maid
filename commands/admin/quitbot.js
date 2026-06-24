const {
    PermissionsBitField,
    SlashCommandBuilder
} = require('discord.js');

const {
    createUserEmbed
} = require('../../utils/embeds');

async function canQuitBot(
    interaction
) {

    const ownerIds =
        (process.env.OWNER_IDS ?? '')
            .split(
                ','
            )
            .map(
                (id) =>
                    id.trim()
            )
            .filter(
                Boolean
            );

    if (
        ownerIds.includes(
            interaction.user.id
        )
    )
        return true;

    if (
        interaction.guild?.ownerId === interaction.user.id
    )
        return true;

    return interaction.memberPermissions?.has(
        PermissionsBitField.Flags.Administrator
    );

}

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'quitbot'
            )
            .setDescription(
                'Safely shut down MPC Maid'
            )
            .setDefaultMemberPermissions(
                PermissionsBitField.Flags.Administrator
            ),

    async execute(
        interaction
    ) {

        if (
            !await canQuitBot(
                interaction
            )
        ) {

            await interaction.reply({
                content:
                    'Only an admin or bot owner can shut me down.',
                flags:
                    64
            });

            return;

        }

        await interaction.deferReply({
            flags:
                64
        });

        const sent =
            interaction.client.sendGameChatMessage
                ? await interaction.client.sendGameChatMessage(
                    'MPC Maid is going offline for a bit. Be good, or at least be funny.'
                )
                : false;

        const embed =
            createUserEmbed(
                interaction,
                {
                    command:
                        '/quitbot',
                    title:
                        'Bot Shutdown',
                    description:
                        sent
                            ? 'Shutdown message sent. MPC Maid is going offline now.'
                            : 'I could not post in game chat, but MPC Maid is going offline now.'
                }
            );

        await interaction.editReply({
            embeds: [
                embed
            ]
        });

        setTimeout(
            () => {
                interaction.client.destroy();
                process.exit(
                    0
                );
            },
            1000
        );

    }

};
