const {
    createEmbed
} = require('./embeds');

const {
    getRandomGif
} = require('./gifs');

const {
    getRandomColor
} = require('../data/constants');

const {
    mpcLogoAttachment
} = require('./mpcLogo');

const {
    commandFooter
} = require('./version');

function buildDropPost(
    options = {}
) {

    const result =
        options.imageUrl
            ? null
            : getRandomGif(
                'titty_drop'
            );

    const imageUrl =
        options.imageUrl ||
        result.url;

    const footerText =
        options.footerText ||
        `GIF #${result.index}/${result.total}`;

    const embed =
        createEmbed({
            color:
                getRandomColor(),
            authorName:
                options.authorName ||
                'MPC Maid',
            authorIcon:
                mpcLogoAttachment,
            thumbnail:
                options.thumbnail,
            title:
                'Titty Drop',
            description:
                options.description,
        image:
            imageUrl,
        footerText:
            commandFooter(
                '/drop',
                footerText
            ),
        timestamp:
            true
        });

    return {
        embeds: [
            embed
        ]
    };

}

module.exports = {
    buildDropPost
};
