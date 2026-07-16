const ROLES =
    require('../data/roles.json');

const titlePools = {
    male: {
        single: {
            performance: [
                'Silver Tongue',
                'Smooth Operator',
                'Bedroom Director',
                'Velvet Performer',
                'Midnight Maestro'
            ],
            stamina: [
                'Night Owl',
                'Iron Endurance',
                'After Midnight',
                'Never Off Duty',
                'Dawn Survivor'
            ],
            fame: [
                'Club Favorite',
                'Midnight Celebrity',
                'Velvet Icon',
                'House Legend',
                'King of Midnight'
            ]
        },

        combo: {
            fame_performance: [
                'Velvet Superstar',
                'Main Attraction',
                'Midnight Headliner',
                'Club Royalty',
                'Living Fantasy'
            ],
            fame_stamina: [
                'Afterparty King',
                'Sleepless Idol',
                'Nightlife Legend',
                'Last One Standing',
                'Midnight Emperor'
            ],
            performance_stamina: [
                'Relentless Stud',
                'One-Take Legend',
                'Endless Appetite',
                'Untamed Performer',
                'Bedroom Machine'
            ]
        },

        balanced: [
            'Gentleman of Midnight',
            'Club Veteran',
            'Velvet Gentleman',
            'The Complete Package',
            'MPC Elite'
        ]
    },
    female: {
        single: {
            performance: [
                'Velvet Vixen',
                'Scene Goddess',
                'Spotlight Temptress',
                'Midnight Muse',
                'Bedroom Queen'
            ],
            stamina: [
                'Night Temptress',
                'After Midnight',
                'Endless Desire',
                'Velvet Addiction',
                'Queen of the Night'
            ],
            fame: [
                'Club Darling',
                'Velvet Icon',
                'Midnight Queen',
                'Fantasy Girl',
                'House Goddess'
            ]
        },

        combo: {
            fame_performance: [
                'Velvet Superstar',
                'Midnight Diva',
                'Club Royalty',
                'Ultimate Fantasy',
                'Living Temptation'
            ],
            fame_stamina: [
                'Afterparty Queen',
                'Sleepless Siren',
                'Nightlife Goddess',
                'Last Girl Standing',
                'Midnight Empress'
            ],
            performance_stamina: [
                'Relentless Vixen',
                'One-Take Goddess',
                'Endless Desire',
                'Bedroom Addiction',
                'Velvet Temptation'
            ]
        },

        balanced: [
            'Lady of Midnight',
            'Velvet Queen',
            'Midnight Darling',
            'The Complete Fantasy',
            'MPC Elite'
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
