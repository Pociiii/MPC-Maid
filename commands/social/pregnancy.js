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

const {
    isCarrierEligible
} = require('../../utils/pregnancy');

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'pregnancy'
            )
            .setDescription(
                'Check pregnancy and fertility status'
            )
            .addUserOption(
                (option) =>
                    option
                        .setName(
                            'user'
                        )
                        .setDescription(
                            'The user to inspect'
                        )
                        .setRequired(
                            false
                        )
            ),

    async execute(
        interaction
    ) {

        await interaction.deferReply({
            flags:
                64
        });

        const target =
            interaction.options.getUser(
                'user'
            ) ??
            interaction.user;

        const targetMember =
            await interaction.guild.members.fetch(
                target.id
            ).catch(
                () => null
            );

        const canCarry =
            isCarrierEligible(
                targetMember
            );

        const [
            status,
            dailyFertility
        ] =
            await Promise.all([
                getPregnancyStatus(
                    target.id
                ),
                canCarry
                    ? getDailyCarrierFertility(
                        target.id
                    )
                    : Promise.resolve(
                        null
                    )
            ]);

        await interaction.editReply({
            embeds: [
                buildPregnancyStatusEmbed(
                    target,
                    status,
                    dailyFertility
                )
            ]
        });

    }

};
