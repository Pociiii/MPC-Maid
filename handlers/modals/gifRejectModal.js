const {
    createEmbed
} = require('../../utils/embeds');

const {
    getRandomColor
} = require('../../data/constants');

function getRejectedGifUrl(
    interaction
) {

    const embed =
        interaction.message?.embeds?.[0];

    const urlField =
        embed?.fields?.find(
            (field) =>
                field.name === 'URL'
        );

    return urlField?.value ||
        embed?.image?.url ||
        null;

}

module.exports = {


async execute(
    interaction
) {

    const parts =
        interaction.customId.split(
            ':'
        );

    const category =
        parts.length >= 4
            ? `${parts[1]}:${parts[2]}`
            : parts[1];

    const submitterId =
        parts[parts.length - 1];

    const reason =
        interaction.fields.getTextInputValue(
            'reason'
        );

    const rejectedGifUrl =
        getRejectedGifUrl(
            interaction
        );

    let dmSent = true;

    try {

        const user =
            await interaction.client.users.fetch(
                submitterId
            );

        const dmEmbed =
            createEmbed({
                color:
                    getRandomColor(),
                title:
                    'GIF Submission Rejected',
                description:
                    'Your GIF submission was rejected. You can submit another GIF at any time.',
                image:
                    rejectedGifUrl,
                footerText:
                    '/gifsubmit',
                timestamp:
                    true
            });

        dmEmbed.addFields(
            {
                name:
                    'Category',
                value:
                    category,
                inline:
                    true
            },
            {
                name:
                    'Refused Link',
                value:
                    rejectedGifUrl ||
                    'Link unavailable',
                inline:
                    false
            },
            {
                name:
                    'Reason',
                value:
                    reason,
                inline:
                    false
            }
        );

        await user.send({
            embeds: [
                dmEmbed
            ]
        });

    } catch {

        dmSent = false;

    }

    await interaction.update({

        content:


`Rejected by ${interaction.user}

Reason: ${reason}

DM: ${
dmSent
? 'Sent'
: 'Failed (DMs closed)'
}`,


        embeds:
            interaction.message.embeds,

        components: []

    });

}


};
