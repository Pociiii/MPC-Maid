const {
    SlashCommandBuilder
} = require('discord.js');

const {
    getDailyCarrierFertility,
    getPregnancyStatus
} = require('../../database/pregnancy');

const {
    buildPregnancyStatusEmbed
} = require('../../features/pregnancy/pregnancyEmbeds');

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'pregnancy'
            )
            .setDescription(
                'Check your pregnancy and fertility status'
            ),

    async execute(
        interaction
    ) {

        await interaction.deferReply({
            flags:
                64
        });

        const target =
            interaction.user;

        const targetMember =
            await interaction.guild.members.fetch(
                target.id
            ).catch(
                () => null
            );

        const [
            status,
            dailyFertility
        ] =
            await Promise.all([
                getPregnancyStatus(
                    target.id
                ),
                getDailyCarrierFertility(
                    target.id
                )
            ]);

        await interaction.editReply({
            embeds: [
                buildPregnancyStatusEmbed(
                    targetMember ?? target,
                    status,
                    dailyFertility
                )
            ]
        });

    }

};
