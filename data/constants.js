const CYBER_COLORS = [
    '#FF2E88',
    '#A020F0',
    '#00BFFF',
    '#00FFFF',
    '#C724FF',
    '#FF00FF',
    '#4D6CFF',
    '#FF4FD8',
    '#7A00FF',
    '#00FFD5'
];

const COLORS = {
    DEFAULT: '#ff69b4',
    SUCCESS: '#57F287',
    ERROR: '#ED4245'
};

function getRandomColor() {

    return CYBER_COLORS[
        Math.floor(
            Math.random() * CYBER_COLORS.length
        )
    ];

}

const ECONOMY = {
    STARTING_COINS: 500
};

const STATS = {
    DEFAULT_PERFORMANCE: 1,
    DEFAULT_STAMINA: 1,
    DEFAULT_FAME: 1,
    DEFAULT_RANKING: 0,
    DEFAULT_SPANKS_TAKEN: 0,
    DEFAULT_SPANKS_GIVEN: 0
};

const SCENE_PHASES = {
    FOREPLAY: 'foreplay',
    ORAL: 'oral',
    SEX: 'sex',
    FINALE: 'finale'
};

const RANKS = {
    AMATEUR: {
        value: 0,
        title: 'Amateur'
    },

    RISING_STAR: {
        value: 500,
        title: 'Rising Star'
    },

    PROFESSIONAL: {
        value: 1000,
        title: 'Professional'
    },

    TOP_PERFORMER: {
        value: 1500,
        title: 'Top Performer'
    },

    HALL_OF_FAME: {
        value: 2500,
        title: 'Hall of Fame'
    }
};

const CHANNELS= {

    GIF_REVIEW: '1515932224464224376',
    RUMORS: '1504424543865929888'

}

const COOLDOWNS = {
    DROP: 600,
    WIGGLE: 600,
    FLEX: 600,
    HORNY: 900
};

module.exports = {
    COLORS,
    CYBER_COLORS,
    getRandomColor,
    ECONOMY,
    STATS,
    SCENE_PHASES,
    RANKS,
    COOLDOWNS,
    CHANNELS
};