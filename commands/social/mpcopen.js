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

        await interaction.deferReply({
            flags:
                64
        });

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

            await interaction.editReply({
                content:
                    'Room name and message cannot be blank.'
            });

            return;

        }

        if (
            !isImageAttachment(
                media
            )
        ) {

            await interaction.editReply({
                content:
                    'Please upload a picture or GIF.'
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

        const channel =
            interaction.channel;

        if (
            !channel?.send
        ) {

            await interaction.editReply({
                content:
                    'I could not post the room announcement in this channel.'
            });

            return;

        }

        const post =
            await channel.send({
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

        await interaction.editReply({
            content:
                `Room opening posted: ${post.url}`
        });

    }

};
