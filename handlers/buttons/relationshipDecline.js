const {
    getRelationshipRequest,
    setRelationshipRequestStatus
} = require('../../utils/relationships');

module.exports = {

    customId:
        'relationship_decline',

    async execute(
        interaction
    ) {

        const requestId =
            interaction.customId.split(
                ':'
            )[1];

        const request =
            await getRelationshipRequest(
                requestId
            );

        if (
            !request
        ) {

            await interaction.reply({
                content:
                    'This relationship request no longer exists.',
                flags:
                    64
            });

            return;

        }

        if (
            interaction.user.id !== request.target_id
        ) {

            await interaction.reply({
                content:
                    'This relationship request is not for you.',
                flags:
                    64
            });

            return;

        }

        await setRelationshipRequestStatus(
            request.id,
            'declined'
        );

        await interaction.update({
            content:
                'Relationship request declined.',
            embeds:
                interaction.message.embeds,
            components:
                []
        });

    }

};
