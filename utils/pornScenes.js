const fs =
    require('fs');

const path =
    require('path');

const {
    getRuntimeDataPath
} = require('./runtimeData');

const pendingRequestsPath =
    getRuntimeDataPath(
        'porn-scene-requests.json'
    );

function loadPendingRequests() {

    try {

        const stored =
            JSON.parse(
                fs.readFileSync(
                    pendingRequestsPath,
                    'utf8'
                )
            );

        return new Map(
            Array.isArray(
                stored
            )
                ? stored
                : []
        );

    }
    catch (error) {

        if (
            error.code !== 'ENOENT'
        )
            console.error(
                'PORN SCENE REQUEST RESTORE ERROR',
                error
            );

        return new Map();

    }

}

const pendingRequests =
    loadPendingRequests();

function persistPendingRequests() {

    fs.mkdirSync(
        path.dirname(
            pendingRequestsPath
        ),
        {
            recursive:
                true
        }
    );

    fs.writeFileSync(
        pendingRequestsPath,
        JSON.stringify(
            Array.from(
                pendingRequests.entries()
            ),
            null,
            2
        )
    );

}

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

    persistPendingRequests();

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

function consumePendingRequest(
    requesterId,
    targetId
) {

    const key =
        getPendingKey(
            requesterId,
            targetId
        );

    const request =
        pendingRequests.get(
            key
        );

    if (
        request
    ) {

        pendingRequests.delete(
            key
        );

        persistPendingRequests();

    }

    return request ?? null;

}

function removePendingRequest(
    requesterId,
    targetId
) {

    const removed =
        pendingRequests.delete(
        getPendingKey(
            requesterId,
            targetId
        )
    );

    if (
        removed
    )
        persistPendingRequests();

}

function getPendingRequests() {

    return Array.from(
        pendingRequests.entries(),
        ([key, request]) => {

            const [
                requesterId,
                targetId
            ] = key.split(
                ':'
            );

            return {
                requesterId,
                targetId,
                ...request
            };

        }
    );

}

function isBusy(
    userId
) {

    return busyUsers.has(
        userId
    );

}

function setUserBusy(
    userId,
    data = {}
) {

    busyUsers.set(
        String(
            userId
        ),
        {
            ...data,
            type:
                data.type ?? 'activity'
        }
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
    consumePendingRequest,
    removePendingRequest,
    getPendingRequests,
    isBusy,
    setUserBusy,
    setSceneBusy,
    clearSceneBusy,
    getBusyUser,
    clearUserBusy,
    clearAllSceneBusy
};
