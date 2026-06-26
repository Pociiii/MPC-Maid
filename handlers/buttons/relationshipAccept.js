const {
    getRandomColor
} = require('../../data/constants');

const {
    mpc_logo
} = require('../../utils/emojis');

const {
    postMoment
} = require('../../utils/moments');

const {
    assertNoFamilyRelationshipBetween,
    countBesties,
    createRelationship,
    createSiblingLinksForNewChild,
    formatDate,
    getParentTypeForMember,
    getRelationshipRequest,
    getRomanticLabelForTarget,
    hasParent,
    hasSpouse,
    relationshipExists,
    setRelationshipRequestStatus
} = require('../../utils/relationships');

function buildAcceptResult(
    successText,
    linkLabel,
    requesterMember,
    targetMember,
    request
) {

    return {
        linkLabel,
        requesterMember,
        request,
        successText,
        targetMember
    };

}

function isExpired(
    request
) {

    return request.expires_at &&
        new Date(
            request.expires_at
        ) < new Date();

}

async function acceptRequest(
    interaction,
    request
) {

    const guild =
        await interaction.client.guilds.fetch(
            request.guild_id
        );

    const requesterMember =
        await guild.members.fetch(
            request.requester_id
        );

    const targetMember =
        await guild.members.fetch(
            request.target_id
        );

    if (
        request.type === 'adopt'
    ) {

        const parentType =
            getParentTypeForMember(
                requesterMember
            );

        await assertNoFamilyRelationshipBetween(
            request.requester_id,
            request.target_id
        );

        if (
            await hasParent(
                request.target_id,
                parentType
            )
        )
            throw new Error(
                `You already have a ${parentType}.`
            );

        await createRelationship(
            parentType,
            request.requester_id,
            request.target_id
        );

        await createSiblingLinksForNewChild(
            request.requester_id,
            request.target_id,
            parentType
        );

        return buildAcceptResult(
            `<@${request.requester_id}> is now listed as your ${parentType}.`,
            parentType === 'mother'
                ? 'Mother / Child'
                : 'Father / Child',
            requesterMember,
            targetMember,
            request
        );

    }

    if (
        request.type === 'sibling'
    ) {

        await assertNoFamilyRelationshipBetween(
            request.requester_id,
            request.target_id
        );

        await createRelationship(
            'sibling',
            request.requester_id,
            request.target_id
        );

        return buildAcceptResult(
            `You and <@${request.requester_id}> are now siblings.`,
            'Siblings',
            requesterMember,
            targetMember,
            request
        );

    }

    if (
        request.type === 'marriage'
    ) {

        getRomanticLabelForTarget(
            requesterMember,
            'marriage'
        );

        getRomanticLabelForTarget(
            targetMember,
            'marriage'
        );

        if (
            await hasSpouse(
                request.requester_id
            ) ||
            await hasSpouse(
                request.target_id
            )
        )
            throw new Error(
                'One of you is already married.'
            );

        await createRelationship(
            'marriage',
            request.requester_id,
            request.target_id,
            request.started_at
        );

        return buildAcceptResult(
            `You and <@${request.requester_id}> are now married.`,
            'Marriage',
            requesterMember,
            targetMember,
            request
        );

    }

    if (
        request.type === 'dating'
    ) {

        getRomanticLabelForTarget(
            requesterMember,
            'dating'
        );

        getRomanticLabelForTarget(
            targetMember,
            'dating'
        );

        if (
            await relationshipExists(
                'dating',
                request.requester_id,
                request.target_id
            )
        )
            throw new Error(
                'You are already dating.'
            );

        await createRelationship(
            'dating',
            request.requester_id,
            request.target_id,
            request.started_at
        );

        return buildAcceptResult(
            `You and <@${request.requester_id}> are now dating.`,
            'Dating',
            requesterMember,
            targetMember,
            request
        );

    }

    if (
        request.type === 'bestie'
    ) {

        if (
            await relationshipExists(
                'bestie',
                request.requester_id,
                request.target_id
            )
        )
            throw new Error(
                'You are already Besties.'
            );

        if (
            await countBesties(
                request.requester_id
            ) >= 3 ||
            await countBesties(
                request.target_id
            ) >= 3
        )
            throw new Error(
                'One of you already has 3 Besties.'
            );

        await createRelationship(
            'bestie',
            request.requester_id,
            request.target_id
        );

        return buildAcceptResult(
            `You and <@${request.requester_id}> are now Besties.`,
            'Besties',
            requesterMember,
            targetMember,
            request
        );

    }

    throw new Error(
        'Unknown relationship request type.'
    );

}

async function postRelationshipMoment(
    interaction,
    result
) {

    const fields = [
        {
            name:
                '\uD83E\uDD1D Bond',
            value:
                result.linkLabel,
            inline:
                true
        }
    ];

    if (
        result.request.started_at
    )
        fields.push(
            {
                name:
                    '\uD83D\uDCC5 Since',
                value:
                    formatDate(
                        result.request.started_at
                    ),
                inline:
                    true
            }
        );

    await postMoment(
        interaction.client,
        {
            type:
                'relationship_created',
            color:
                getRandomColor(),
            authorName:
                result.requesterMember.displayName,
            authorIcon:
                result.requesterMember.user.displayAvatarURL(),
            thumbnail:
                result.targetMember.user.displayAvatarURL(),
            title:
                `${mpc_logo} Moment`,
            flavor:
                `${result.requesterMember} and ${result.targetMember} made it official.`,
            command:
                '/relationship',
            fields
        }
    ).catch(
        (error) =>
            console.error(
                'RELATIONSHIP MOMENT ERROR',
                error
            )
    );

}

module.exports = {

    customId:
        'relationship_accept',

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

        if (
            request.status !== 'pending' ||
            isExpired(
                request
            )
        ) {

            await setRelationshipRequestStatus(
                request.id,
                'expired'
            );

            await interaction.update({
                content:
                    'This relationship request is no longer active.',
                embeds:
                    interaction.message.embeds,
                components:
                    []
            });

            return;

        }

        try {

            const result =
                await acceptRequest(
                    interaction,
                    request
                );

            await setRelationshipRequestStatus(
                request.id,
                'accepted'
            );

            await interaction.update({
                content:
                    result.successText,
                embeds:
                    interaction.message.embeds,
                components:
                    []
            });

            await postRelationshipMoment(
                interaction,
                result
            );

        }
        catch (error) {

            await interaction.reply({
                content:
                    error.message || 'Could not accept this relationship request.',
                flags:
                    64
            });

        }

    }

};
