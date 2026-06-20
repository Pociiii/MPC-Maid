const singleStatTitles = {
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
        'Marathon Muse'
    ],
    fame: [
        'Crowd Favorite',
        'Rising Fantasy',
        'Viral Temptation',
        'Spotlight Star',
        'Household Sin'
    ]
};

const comboTitles = {
    fame_performance: [
        'Main Event',
        'Box Office Babe',
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
};

const balancedTitles = [
    'Jack of All Trades',
    'Triple Threat',
    'Complete Package',
    'Studio Favorite',
    'All-Round Star'
];

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

function getPornCareerTitle(
    user
) {

    const stats =
        [
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

    const highest =
        stats[0].value;

    const lowest =
        stats[stats.length - 1].value;

    const tier =
        getTitleTier(
            highest
        );

    if (
        highest - lowest <= 3
    )
        return balancedTitles[tier];

    if (
        highest >= 10 &&
        stats[0].value - stats[1].value <= 3
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

        return comboTitles[comboKey][tier];

    }

    return singleStatTitles[stats[0].key][tier];

}

function formatPornCareerName(
    displayName,
    user,
    rankTitle
) {

    return `${displayName} - ${getPornCareerTitle(
        user
    )} - ${rankTitle} (${user.ranking})`;

}

module.exports = {
    formatPornCareerName,
    getPornCareerTitle
};
