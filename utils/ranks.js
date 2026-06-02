const { RANKS } = require('../data/constants');

function getRankTitle(ranking) {

    if (ranking >= RANKS.HALL_OF_FAME.value)
        return RANKS.HALL_OF_FAME.title;

    if (ranking >= RANKS.TOP_PERFORMER.value)
        return RANKS.TOP_PERFORMER.title;

    if (ranking >= RANKS.PROFESSIONAL.value)
        return RANKS.PROFESSIONAL.title;

    if (ranking >= RANKS.RISING_STAR.value)
        return RANKS.RISING_STAR.title;

    return RANKS.AMATEUR.title;
}

module.exports = {
    getRankTitle
};