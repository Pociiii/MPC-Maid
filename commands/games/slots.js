const {
    SlashCommandBuilder
} = require('discord.js');

const {
    COOLDOWNS
} = require('../../data/constants');

const {
    handleCooldown
} = require('../../utils/cooldowns');

const {
    getOrCreateUser
} = require('../../utils/users');

const emojis =
    require('../../utils/emojis');

const {
    MAX_BET,
    buildSlotEmbed,
    buildSlotRows,
    createSlotSession,
    spinSession
} = require('../../features/casino/slots');

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'slots'
            )
            .setDescription(
                'Open the slot machine and spin with coins'
            )
            .addIntegerOption(
                (option) =>
                    option
                        .setName(
                            'bet'
                        )
                        .setDescription(
                            `Coins per spin, max ${MAX_BET}`
                        )
                        .setMinValue(
                            1
                        )
                        .setMaxValue(
                            MAX_BET
                        )
                        .setRequired(
                            true
                        )
            ),

    async execute(
        interaction
    ) {

        const bet =
            interaction.options.getInteger(
                'bet'
            );

        const user =
            await getOrCreateUser(
                interaction.user.id
            );

        if (
            user.coins < bet
        ) {

            await interaction.reply({
                content:
                    `You only have ${emojis.coin} **${user.coins} coins**. Lower the bet and try again.`,
                flags:
                    64
            });

            return;

        }

        if (
            await handleCooldown(
                interaction,
                'slots',
                COOLDOWNS.SLOTS
            )
        )
            return;

        const session =
            createSlotSession(
                interaction.user.id,
                bet
            );

        const result =
            await spinSession(
                interaction.client,
                session
            );

        await interaction.reply({
            embeds: [
                buildSlotEmbed(
                    interaction,
                    session,
                    result.user
                )
            ],
            components:
                buildSlotRows(
                    session,
                    result.user
                )
        });

    }

};
