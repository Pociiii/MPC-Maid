function getPregnancyParticipantIds(
    pregnancy
) {

    return [
        pregnancy?.carrier_id,
        pregnancy?.father_id
    ].filter(
        (userId, index, userIds) =>
            userId &&
            userIds.indexOf(
                userId
            ) === index
    );

}

function buildPregnancyAnnouncementPayload(
    pregnancy,
    embed
) {

    const userIds =
        getPregnancyParticipantIds(
            pregnancy
        );

    return {
        content:
            userIds.map(
                (userId) =>
                    `<@${userId}>`
            ).join(
                ' '
            ),
        embeds: [
            embed
        ],
        allowedMentions: {
            users:
                userIds
        }
    };

}

module.exports = {
    buildPregnancyAnnouncementPayload,
    getPregnancyParticipantIds
};
