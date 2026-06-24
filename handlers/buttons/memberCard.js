const {
    generateMemberCard
} = require(
    '../../utils/memberCard'
);

module.exports = {

    async execute(
        interaction
    ) {

        await interaction.deferReply({
            flags:
                64
        });

        const card =
            await generateMemberCard(
                interaction
            );

        await interaction.editReply({

            files: [card]

        });

    }

};
