module.exports = {

    customId:
        'relationship_decline',

    async execute(
        interaction
    ) {

        await interaction.update({

            content:
                '❌ Relationship declined.',

            embeds: [],

            components: []

        });

    }

};