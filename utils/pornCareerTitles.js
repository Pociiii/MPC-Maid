const ROLES =
    require('../data/roles.json');

const titlePools = {
    male: {
        single: {
            performance: [
                'Natural Talent',
                'Scene Stealer',
                'Camera Charmer',
                'Peak Performer',
                'Bedroom Virtuoso'
            ],
            stamina: [
                'Long Take Lover',
                'Tireless Tease',
                'Endurance Star',
                'After Hours Ace',
                'Marathon Lover'
            ],
            fame: [
                'Crowd Favorite',
                'Rising Fantasy',
                'Viral Temptation',
                'Spotlight Star',
                'Household Sin'
            ]
        },
        combo: {
            fame_performance: [
                'Main Event',
                'Box Office Star',
                'Fan Favorite',
                'Headline Act',
                'Studio Icon'
            ],
            fame_stamina: [
                'Encore Machine',
                'Late Night Legend',
                'Crowd Pleaser',
                'Afterparty Star',
                'Midnight Idol'
            ],
            performance_stamina: [
                'Relentless Performer',
                'One-Take Wonder',
                'All Night Pro',
                'Endless Scene Star',
                'No-Cut Legend'
            ]
        },
        balanced: [
            'Jack of All Trades',
            'Triple Threat',
            'Complete Package',
            'Studio Favorite',
            'All-Round Star'
        ]
    },
    female: {
        single: {
            performance: [
                'Natural Talent',
                'Scene Siren',
                'Camera Charmer',
                'Peak Temptress',
                'Bedroom Virtuoso'
            ],
            stamina: [
                'Long Take Lover',
                'Tireless Tease',
                'Endurance Star',
                'After Hours Muse',
                'Marathon Muse'
            ],
            fame: [
                'Crowd Favorite',
                'Rising Fantasy',
                'Viral Temptation',
                'Spotlight Siren',
                'Household Sin'
            ]
        },
        combo: {
            fame_performance: [
                'Main Event',
                'Box Office Siren',
                'Fan Favorite',
                'Headline Muse',
                'Studio Icon'
            ],
            fame_stamina: [
                'Encore Muse',
                'Late Night Legend',
                'Crowd Pleaser',
                'Afterparty Muse',
                'Midnight Idol'
            ],
            performance_stamina: [
                'Relentless Performer',
                'One-Take Wonder',
                'All Night Muse',
                'Endless Scene Star',
                'No-Cut Legend'
            ]
        },
        balanced: [
            'Jack of All Trades',
            'Triple Threat',
            'Complete Package',
            'Studio Muse',
            'All-Round Star'
        ]
    }
};

function getTitleTier(
    value
) {

    if (
        value >= 40
    )
        return 4;

    if (
        value >= 30
    )
        return 3;

    if (
        value >= 20
    )
        return 2;

    if (
        value >= 10
    )
        return 1;

    return 0;

}

function getMemberGender(
    member
) {

    if (
        member?.roles?.cache?.has(
            ROLES.FEMALE
        )
    )
        return 'female';

    return 'male';

}

function getStatRanking(
    user
) {

    return [
        {
            key:
                'performance',
            value:
                user.performance
        },
        {
            key:
                'stamina',
            value:
                user.stamina
        },
        {
            key:
                'fame',
            value:
                user.fame
        }
    ].sort(
        (first, second) =>
            second.value - first.value
    );

}

function getPornCareerTitle(
    user,
    member = null
) {

    const gender =
        getMemberGender(
            member
        );

    const titles =
        titlePools[gender];

    const stats =
        getStatRanking(
            user
        );

    const highest =
        stats[0].value;

    const lowest =
        stats[stats.length - 1].value;

    const tier =
        getTitleTier(
            highest
        );

    if (
        highest - lowest <= 1
    )
        return titles.balanced[tier];

    if (
        highest >= 4 &&
        stats[0].value - stats[1].value <= 2 &&
        stats[1].value - lowest >= 2
    ) {

        const comboKey =
            [
                stats[0].key,
                stats[1].key
            ]
                .sort()
                .join(
                    '_'
                );

        return titles.combo[comboKey][tier];

    }

    return titles.single[stats[0].key][tier];

}

function formatPornCareerName(
    displayName,
    user,
    member = null
) {

    return `${displayName} - ${getPornCareerTitle(
        user,
        member
    )}`;

}

module.exports = {
    formatPornCareerName,
    getPornCareerTitle
};
