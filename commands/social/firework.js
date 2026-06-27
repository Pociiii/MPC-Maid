const {
    SlashCommandBuilder
} = require('discord.js');

const {
    COOLDOWNS,
    ECONOMY
} = require('../../data/constants');

const {
    handleCooldown
} = require('../../utils/cooldowns');

const {
    getOrCreateUser,
    spendCoins
} = require('../../utils/users');

const {
    buildFireworkEmbed,
    getCommandGif
} = require('../../features/social/partyCommands');

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'firework'
            )
            .setDescription(
                'Burn coins on a flashy public flex'
            )
            .addStringOption(
                (option) =>
                    option
                        .setName(
                            'message'
                        )
                        .setDescription(
                            'Short flex text'
                        )
                        .setMaxLength(
                            140
                        )
                        .setRequired(
                            false
                        )
            ),

    async execute(
        interaction
    ) {

        const user =
            await getOrCreateUser(
                interaction.user.id
            );

        if (
            user.coins < ECONOMY.FIREWORK_COST
        ) {

            await interaction.reply({
                content:
                    `You need **${ECONOMY.FIREWORK_COST} coins** to launch a firework. You have **${user.coins}**.`,
                flags:
                    64
            });

            return;

        }

        if (
            await handleCooldown(
                interaction,
                interaction.commandName,
                COOLDOWNS.FIREWORK
            )
        )
            return;

        await interaction.deferReply();

        const paid =
            await spendCoins(
                interaction.user.id,
                ECONOMY.FIREWORK_COST
            );

        if (
            !paid
        ) {

            await interaction.editReply({
                content:
                    `You need **${ECONOMY.FIREWORK_COST} coins** to launch a firework.`
            });

            return;

        }

        const gif =
            getCommandGif(
                'firework',
                [
                    interaction.user.id
                ]
            );

        await interaction.editReply({
            embeds: [
                buildFireworkEmbed(
                    interaction,
                    {
                        cost:
                            ECONOMY.FIREWORK_COST,
                        gif,
                        message:
                            interaction.options.getString(
                                'message'
                            )
                    }
                )
            ]
        });

    }

};
