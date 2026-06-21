const {
    views
} = require('./config');

const {
    buildRows
} = require('./ui');

const {
    builders
} = require('./views');

async function buildLeaderboard(
    interaction,
    view = 'ranking'
) {

    const safeView =
        views[view]
            ? view
            : 'ranking';

    const embed =
        await builders[safeView](
            interaction
        );

    return {
        embeds: [
            embed
        ],
        components:
            buildRows(
                safeView
            )
    };

}

module.exports = {
    buildLeaderboard
};
