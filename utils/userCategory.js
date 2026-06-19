const ROLES =
    require('../data/roles.json');

function getUserCategory(
    interaction
) {

    return getMemberCategory(
        interaction.member
    );

}

function getMemberCategory(
    member
) {

    const isMale =
        member.roles.cache.has(
            ROLES.MALE
        );

    const isFemale =
        member.roles.cache.has(
            ROLES.FEMALE
        );

    const isLightSkin =
        member.roles.cache.has(
            ROLES.LIGHT_SKIN
        );

    const isDarkSkin =
        member.roles.cache.has(
            ROLES.DARK_SKIN
        );

    if (!isMale && !isFemale)
        throw new Error(
            'Missing gender role.'
        );

    if (!isLightSkin && !isDarkSkin)
        throw new Error(
            'Missing skin tone role.'
        );

    if (isMale)
        return isDarkSkin
            ? 'bm'
            : 'wm';

    return isDarkSkin
        ? 'bf'
        : 'wf';

}

module.exports = {
    getUserCategory,
    getMemberCategory
};
