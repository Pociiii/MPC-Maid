const {

    setPartner,
    setMother,
    setFather,

    getRelationshipData

} = require(
    '../../utils/relationships'
);

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

        //
        // PARTNER
        //
        if (
            type === 'partner'
        ) {

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

        }

        //
        // MOTHER
        //
        if (
            type === 'mother'
        ) {

            await setMother(

                requesterId,

                interaction.user.id

            );

        }

        //
        // FATHER
        //
        if (
            type === 'father'
        ) {

            await setFather(

                requesterId,

                interaction.user.id

            );

        }

        const label =
            type.charAt(0).toUpperCase() +
            type.slice(1);

        await interaction.update({

            content:
                `✅ ${label} relationship accepted.`,

            embeds:
                interaction.message.embeds,

            components: []

        });

    }

};