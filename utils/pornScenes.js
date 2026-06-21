const pendingRequests =
    new Map();

const busyUsers =
    new Map();

function getPendingKey(
    requesterId,
    targetId
) {

    return `${requesterId}:${targetId}`;

}

function hasPendingRequest(
    requesterId,
    targetId
) {

    return pendingRequests.has(
        getPendingKey(
            requesterId,
            targetId
        )
    );

}

function addPendingRequest(
    requesterId,
    targetId,
    data
) {

    pendingRequests.set(
        getPendingKey(
            requesterId,
            targetId
        ),
        data
    );

}

function getPendingRequest(
    requesterId,
    targetId
) {

    return pendingRequests.get(
        getPendingKey(
            requesterId,
            targetId
        )
    );

}

function removePendingRequest(
    requesterId,
    targetId
) {

    pendingRequests.delete(
        getPendingKey(
            requesterId,
            targetId
        )
    );

}

function isBusy(
    userId
) {

    return busyUsers.has(
        userId
    );

}

function setSceneBusy(
    requesterId,
    targetId,
    data = {}
) {

    busyUsers.set(
        requesterId,
        {
            ...data,
            partnerId:
                targetId,
            type:
                'pornscene'
        }
    );

    busyUsers.set(
        targetId,
        {
            ...data,
            partnerId:
                requesterId,
            type:
                'pornscene'
        }
    );

}

function clearSceneBusy(
    requesterId,
    targetId
) {

    busyUsers.delete(
        requesterId
    );

    busyUsers.delete(
        targetId
    );

}

function getBusyUser(
    userId
) {

    return busyUsers.get(
        userId
    ) ?? null;

}

function clearUserBusy(
    userId
) {

    const busy =
        getBusyUser(
            userId
        );

    busyUsers.delete(
        userId
    );

    if (
        busy?.partnerId
    ) {

        busyUsers.delete(
            busy.partnerId
        );

    }

    return busy;

}

function clearAllSceneBusy() {

    const count =
        busyUsers.size;

    busyUsers.clear();

    return count;

}

module.exports = {
    hasPendingRequest,
    addPendingRequest,
    getPendingRequest,
    removePendingRequest,
    isBusy,
    setSceneBusy,
    clearSceneBusy,
    getBusyUser,
    clearUserBusy,
    clearAllSceneBusy
};
