const {
    ActionRowBuilder,
    ButtonBuilder
} = require('discord.js');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    mpcLogoAttachment
} = require('../../utils/mpcLogo');

const {
    getRandomGif
} = require('../../utils/gifs');

const {
    getRandomColor
} = require('../../data/constants');

const {
    trackDailyQuest
} = require('../daily-quests/dailyQuests');

const {
    incrementAchievementProgress
} = require('../achievements/achievements');

const {
    commandFooter
} = require('../../utils/version');

function isValidShowcaseAttachment(
    attachment
) {

    return !attachment ||
        attachment.contentType?.startsWith(
            'image/'
        ) ||
        attachment.contentType?.startsWith(
            'video/'
        );

}

function getShowcaseMedia(
    interaction,
    category
) {

    const attachment =
        interaction.options.getAttachment(
            'media'
        );

    if (
        attachment
    )
        return {
            attachment,
            imageUrl:
                attachment.url,
            footerText:
                `Custom media by ${interaction.member.displayName}`
        };

    const result =
        getRandomGif(
            category,
            [
                interaction.user.id
            ]
        );

    return {
        attachment:
            null,
        imageUrl:
            result.url,
        footerText:
            `GIF #${result.index}/${result.total}`
    };

}

function buildShowcaseEmbed(
    interaction,
    {
        commandName,
        description,
        footerText,
        imageUrl,
        title
    }
) {

    return createEmbed({
        color:
            getRandomColor(),
        authorName:
            interaction.member.displayName,
        authorIcon:
            mpcLogoAttachment,
        thumbnail:
            interaction.user.displayAvatarURL(),
        title,
        description,
        image:
            imageUrl,
        footerText:
            commandFooter(
                commandName,
                footerText
            ),
        timestamp:
            true
    });

}

function buildShowcaseButtons(
    buttons
) {

    return new ActionRowBuilder()
        .addComponents(
            ...buttons.map(
                (button) => {

                    const builder =
                        new ButtonBuilder()
                            .setCustomId(
                                button.customId
                            )
                            .setLabel(
                                button.label
                            )
                            .setStyle(
                                button.style
                            );

                    if (
                        button.emoji
                    )
                        builder.setEmoji(
                            button.emoji
                        );

                    return builder;

                }
            )
        );

}

async function trackShowcasePost(
    interaction
) {

    await trackDailyQuest(
        interaction.client,
        interaction.user.id,
        'showcase'
    );

    await incrementAchievementProgress(
        interaction.client,
        interaction.user.id,
        'showcase_posts'
    );

}

module.exports = {
    buildShowcaseButtons,
    buildShowcaseEmbed,
    getShowcaseMedia,
    isValidShowcaseAttachment,
    trackShowcasePost
};
