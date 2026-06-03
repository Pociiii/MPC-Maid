const ranks =
    require('../data/ranks.json');

function getRankTitle(ranking) {

    let current = ranks[0];

    for (const rank of ranks) {

        if (ranking >= rank.minimum)
            current = rank;
    }

    return current.title;
}

module.exports = {
    getRankTitle
};