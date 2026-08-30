const limit =
    10;

const emojis =
    require('../../utils/emojis');

const views = {
    scenes: {
        label:
            'Scenes',
        emoji:
            '\uD83C\uDFAC',
        title:
            'Scenes Leaderboard'
    },
    coins: {
        label:
            'Coins',
        emoji:
            emojis.coin,
        title:
            'Coins Leaderboard'
    },
    spanks: {
        label:
            'Spanks',
        emoji:
            emojis.spank_given,
        title:
            'Spanks Leaderboard'
    },
    kisses: {
        label:
            'Kisses',
        emoji:
            emojis.kiss_given,
        title:
            'Kisses Leaderboard'
    },
    helps: {
        label:
            'Helps',
        emoji:
            '\uD83E\uDD1D',
        title:
            'Horny Help Leaderboard'
    },
    achievements: {
        label:
            'Achievements',
        emoji:
            '\uD83C\uDFC5',
        title:
            'Achievement Points'
    }
};

module.exports = {
    limit,
    views
};
