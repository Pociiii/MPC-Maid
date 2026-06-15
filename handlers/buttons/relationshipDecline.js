module.exports = {

    customId:
        'relationship_decline',

    async execute(
        interaction
    ) {

        const [

            ,
            type

        ] =
            interaction.customId.split(
                ':'
            );

        const label =
            type.charAt(0).toUpperCase() +
            type.slice(1);

        await interaction.update({

            content:
                `❌ ${label} relationship declined.`,

            embeds:
                interaction.message.embeds,

            components: []

        });

    }

};