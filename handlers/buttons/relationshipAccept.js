const {
    setPartner,
    getRelationshipData
} = require('../../utils/relationships');

module.exports = {

    customId:
        'relationship_accept',

    async execute(
        interaction
    ) {

        const [
            ,
            type,
            requesterId
        ] =
            interaction.customId.split(
                ':'
            );

        if (
            type !== 'partner'
        )
            return;

        const requester =
            await getRelationshipData(
                requesterId
            );

        const target =
            await getRelationshipData(
                interaction.user.id
            );

        if (
            requester.partner_id ||
            target.partner_id
        ) {

            return interaction.reply({

                content:
                    '❌ One of the users already has a partner.',

                flags: 64

            });

        }

        await setPartner(

            requesterId,

            interaction.user.id

        );

        await interaction.update({

            content:
                '❤️ Relationship accepted.',

            embeds: [],

            components: []

        });

    }

};