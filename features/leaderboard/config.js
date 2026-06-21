const limit =
    10;

const emojis =
    require('../../utils/emojis');

const views = {
    ranking: {
        label:
            'Ranking',
        emoji:
            '🏆',
        title:
            'Ranking Leaderboard'
    },
    scenes: {
        label:
            'Scenes',
        emoji:
            '🎬',
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
    achievements: {
        label:
            'Achievements',
        emoji:
            '🏅',
        title:
            'Achievement Points'
    }
};

module.exports = {
    limit,
    views
};
