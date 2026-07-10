const {
    getSceneCategoryLabel
} = require('../../data/sceneSubmitGroups');

function getSceneCategoryGroup(
    sceneCategory
) {

    return sceneCategory
        .split(
            '_'
        )
        .every(
            (part) =>
                part.endsWith(
                    'f'
                )
        )
        ? 'ff'
        : 'mf';

}

function getSceneCategoryName(
    sceneCategory
) {

    return getSceneCategoryLabel(
        getSceneCategoryGroup(
            sceneCategory
        ),
        sceneCategory
    );

}

function getTwoPersonSceneCategory(
    firstCategory,
    secondCategory
) {

    const categories = [
        firstCategory,
        secondCategory
    ];

    const maleCategory =
        categories.find(
            (category) =>
                category.endsWith(
                    'm'
                )
        );

    const femaleCategories =
        categories.filter(
            (category) =>
                category.endsWith(
                    'f'
                )
        );

    if (
        maleCategory &&
        femaleCategories.length === 1
    )
        return `${maleCategory}_${femaleCategories[0]}`;

    if (
        femaleCategories.length === 2
    ) {

        const uniqueCategories =
            [...new Set(
                femaleCategories
            )];

        return uniqueCategories.length === 1
            ? `${uniqueCategories[0]}_${uniqueCategories[0]}`
            : 'wf_bf';

    }

    return null;

}

function displayNameFor(
    member,
    user
) {

    return member?.displayName ??
        user?.globalName ??
        user?.username ??
        'that user';

}

async function safeSendUserDm(
    client,
    userId,
    content
) {

    try {

        const user =
            await client.users.fetch(
                userId
            );

        await user.send({
            content
        });

        return true;

    }
    catch {

        return false;

    }

}

async function fetchConfiguredGuildMember(
    client,
    userId
) {

    const guild =
        client.guilds.cache.get(
            process.env.GUILD_ID
        ) ??
        await client.guilds.fetch(
            process.env.GUILD_ID
        );

    return guild.members.fetch(
        userId
    );

}

module.exports = {
    displayNameFor,
    fetchConfiguredGuildMember,
    getSceneCategoryName,
    getTwoPersonSceneCategory,
    safeSendUserDm
};
