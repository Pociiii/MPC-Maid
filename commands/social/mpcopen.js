const {
    SlashCommandBuilder
} = require('discord.js');

const {
    getRandomColor
} = require('../../data/constants');

const ROLES =
    require('../../data/roles.json');

const {
    createEmbed,
    getDisplayAvatar,
    getDisplayName
} = require('../../utils/embeds');

const {
    pickOne
} = require('../../utils/flavorText');

const fomoSentences = [
    'Be there. Or hear about it the next day.',
    'Tonight becomes tomorrow\'s gossip.',
    'Don\'t be the one asking what happened.',
    'The best stories start with showing up.',
    'Your FOMO has officially been warned.',
    'Some nights should not be missed.',
    'Come make a memory—or become jealous of one.',
    'The room is open. Your alibi can wait.'
];

function isImageAttachment(
    attachment
) {

    return !attachment ||
        attachment.contentType?.startsWith(
            'image/'
        );

}

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'mpcopen'
            )
            .setDescription(
                'Announce that an MPC room is open'
            )
            .addStringOption(
                (option) =>
                    option
                        .setName(
                            'room-name'
                        )
                        .setDescription(
                            'Room name shown in the announcement title'
                        )
                        .setMinLength(
                            1
                        )
                        .setMaxLength(
                            230
                        )
                        .setRequired(
                            true
                        )
            )
            .addStringOption(
                (option) =>
                    option
                        .setName(
                            'message'
                        )
                        .setDescription(
                            'Message from the host'
                        )
                        .setMinLength(
                            1
                        )
                        .setMaxLength(
                            3500
                        )
                        .setRequired(
                            true
                        )
            )
            .addAttachmentOption(
                (option) =>
                    option
                        .setName(
                            'media'
                        )
                        .setDescription(
                            'Optional picture or GIF'
                        )
                        .setRequired(
                            false
                        )
            ),

    async execute(
        interaction
    ) {

        const roomName =
            interaction.options.getString(
                'room-name',
                true
            ).trim();

        const hostMessage =
            interaction.options.getString(
                'message',
                true
            ).trim();

        const media =
            interaction.options.getAttachment(
                'media'
            );

        if (
            !roomName ||
            !hostMessage
        ) {

            await interaction.reply({
                content:
                    'Room name and message cannot be blank.',
                flags:
                    64
            });

            return;

        }

        if (
            !isImageAttachment(
                media
            )
        ) {

            await interaction.reply({
                content:
                    'Please upload a picture or GIF.',
                flags:
                    64
            });

            return;

        }

        const embed =
            createEmbed({
                color:
                    getRandomColor(),
                authorName:
                    getDisplayName(
                        interaction.member ??
                        interaction.user
                    ),
                thumbnail:
                    getDisplayAvatar(
                        interaction.member ??
                        interaction.user
                    ),
                title:
                    `${roomName} is now open!`,
                description:
                    `${hostMessage}\n\n*${pickOne(
                        fomoSentences
                    )}*`,
                image:
                    media?.url,
                footerText:
                    'MPC Maid - Room Open',
                timestamp:
                    true
            });

        await interaction.reply({
            content:
                `<@&${ROLES.STILETTO_GANG}> <@&${ROLES.TAILORED_FEW}> <@&${ROLES.EVENTS}> @here`,
            embeds: [
                embed
            ],
            allowedMentions: {
                parse: [
                    'everyone'
                ],
                roles: [
                    ROLES.STILETTO_GANG,
                    ROLES.TAILORED_FEW,
                    ROLES.EVENTS
                ],
                users: []
            }
        });

    }

};
