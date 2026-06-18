const {
    generateMemberCard
} = require(
    '../../utils/memberCard'
);

module.exports = {

    async execute(
        interaction
    ) {

        const card =
            await generateMemberCard(
                interaction
            );

        await interaction.reply({

            files: [card],

            flags: 64

        });

    }

};