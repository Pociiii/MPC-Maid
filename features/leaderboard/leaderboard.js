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
    view = 'scenes'
) {

    const safeView =
        views[view]
            ? view
            : 'scenes';

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
