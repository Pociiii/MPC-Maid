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
    adpLogoPath,
    adpLogoAttachment
} = require('./adpLogo');

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
                adpLogoAttachment,
            thumbnail:
                options.thumbnail,
            title:
                'Titty Drop',
            description:
                options.description,
            image:
                imageUrl,
            footerText:
                footerText,
            timestamp:
                true
        });

    return {
        embeds: [
            embed
        ],
        files: [
            adpLogoPath
        ]
    };

}

module.exports = {
    buildDropPost
};
