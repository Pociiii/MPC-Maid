const refreshIntervalMs =
    5 * 60 * 1000;

let lastRefreshAt =
    0;

let refreshPromise =
    null;

async function getGuildMembers(
    guild
) {

    const now =
        Date.now();

    if (
        refreshPromise
    )
        return refreshPromise;

    if (
        guild.members.cache.size > 0 &&
        now - lastRefreshAt < refreshIntervalMs
    )
        return guild.members.cache;

    lastRefreshAt =
        now;

    refreshPromise =
        guild.members.fetch()
            .catch(
                (error) => {

                    console.error(
                        'MEMBER CACHE REFRESH ERROR'
                    );
                    console.error(
                        error
                    );

                    return guild.members.cache;

                }
            )
            .finally(
                () => {

                    refreshPromise =
                        null;

                }
            );

    return refreshPromise;

}

module.exports = {
    getGuildMembers
};
