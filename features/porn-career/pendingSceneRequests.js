const {
    addBooster
} = require('../../utils/boosters');

const {
    consumePendingRequest,
    getPendingRequest
} = require('../../utils/pornScenes');

async function returnReservedBooster(requesterId, request) {
    if (!request?.booster)
        return false;

    await addBooster(
        requesterId,
        request.booster.stat,
        request.booster.tier
    );
    return true;
}

async function editPendingRequestDm(client, targetId, request, content) {
    if (!request?.messageId)
        return false;

    const target = await client.users.fetch(targetId).catch(() => null);
    const dmChannel = await target?.createDM().catch(() => null);
    const message = await dmChannel?.messages.fetch(request.messageId).catch(() => null);

    if (!message)
        return false;

    await message.edit({
        content,
        embeds: [],
        components: [],
        attachments: []
    }).catch(() => null);
    return true;
}

async function resolvePendingRequest(
    client,
    requesterId,
    targetId,
    content,
    expectedMessageId = null
) {
    const current = getPendingRequest(requesterId, targetId);

    if (
        !current ||
        (expectedMessageId && current.messageId !== expectedMessageId)
    )
        return null;

    const request = consumePendingRequest(requesterId, targetId);

    if (!request)
        return null;

    await returnReservedBooster(requesterId, request);
    await editPendingRequestDm(client, targetId, request, content);
    return request;
}

module.exports = {
    editPendingRequestDm,
    resolvePendingRequest,
    returnReservedBooster
};
