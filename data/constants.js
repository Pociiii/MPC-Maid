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

const CHANNELS = {

    INBOX_FORUM: '1515930617068392448',
    INBOX_LOG: '1516017240472813598',
    INBOX_ROLE_REQUESTS: '1515932488223031357',
    INBOX_FEEDBACK: '1518005640205701362',
    UPDATES: '1518153153860730981',
    COMMANDS: '1495316822646325268',
    GAME_CHAT: '1499291222228078715',
    GIF_REVIEW: '1515932224464224376',
    RUMORS: '1504424543865929888',
    MAID_FEED: '1518308768335528187',
    GIFS: '1511804100604334330',
    SHOWCASE: '1495980074586083368',
    TITTY_DROP: '1518478547067342999',
    CASINO: '1503674706505764915',
    CUSTOM_SCENE: '1517485570656571462',
    PORN_CAREER: '1493483825869754440'
};

const COOLDOWNS = {
    DROP: 600,
    WIGGLE: 1800,
    FLEX: 1800,
    HORNY: 1800,
    DICE: 900,
    BLACKJACK: 900,
    CUSTOM_SCENE: 1800,
    PORN_SCENE_REQUEST: 600,
    MATCHME: 86400
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
