const {
    SlashCommandBuilder
} = require('discord.js');

const {
    createBotEmbed
} = require('../../utils/embeds');

function parseTimestamp(
    value
) {

    const input =
        value.trim();

    const discordTimestamp =
        input.match(
            /^<t:(\d+)(?::[tTdDfFR])?>$/
        );

    if (
        discordTimestamp
    )
        return Number(
            discordTimestamp[1]
        );

    if (
        /^\d{10}$/.test(
            input
        )
    )
        return Number(
            input
        );

    if (
        /^\d{13}$/.test(
            input
        )
    )
        return Math.floor(
            Number(
                input
            ) / 1000
        );

    const parsed =
        Date.parse(
            input
        );

    if (
        Number.isNaN(
            parsed
        )
    )
        return null;

    return Math.floor(
        parsed / 1000
    );

}

function formatTimestamp(
    timestamp
) {

    return `<t:${timestamp}:F>\n<t:${timestamp}:R>`;

}

function getOptionString(
    interaction,
    name
) {

    return interaction.options.getString(
        name
    );

}

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'eventpost'
            )
            .setDescription(
                'Post a clean event announcement in this channel'
            )
            .addStringOption(
                (option) =>
                    option
                        .setName(
                            'title'
                        )
                        .setDescription(
                            'Event name, room name, or headline'
                        )
                        .setRequired(
                            true
                        )
            )
            .addStringOption(
                (option) =>
                    option
                        .setName(
                            'when'
                        )
                        .setDescription(
                            'Date/time, Discord timestamp, or Unix timestamp'
                        )
                        .setRequired(
                            true
                        )
            )
            .addStringOption(
                (option) =>
                    option
                        .setName(
                            'room'
                        )
                        .setDescription(
                            'Room or location name'
                        )
                        .setRequired(
                            true
                        )
            )
            .addStringOption(
                (option) =>
                    option
                        .setName(
                            'type'
                        )
                        .setDescription(
                            'Public or private room'
                        )
                        .setRequired(
                            true
                        )
                        .addChoices(
                            {
                                name:
                                    'Public Room',
                                value:
                                    'Public Room'
                            },
                            {
                                name:
                                    'Private Room',
                                value:
                                    'Private Room'
                            }
                        )
            )
            .addUserOption(
                (option) =>
                    option
                        .setName(
                            'host'
                        )
                        .setDescription(
                            'Main host'
                        )
                        .setRequired(
                            true
                        )
            )
            .addUserOption(
                (option) =>
                    option
                        .setName(
                            'cohost'
                        )
                        .setDescription(
                            'Optional co-host'
                        )
                        .setRequired(
                            false
                        )
            )
            .addRoleOption(
                (option) =>
                    option
                        .setName(
                            'ping'
                        )
                        .setDescription(
                            'Optional role to ping'
                        )
                        .setRequired(
                            false
                        )
            )
            .addStringOption(
                (option) =>
                    option
                        .setName(
                            'theme'
                        )
                        .setDescription(
                            'Short theme or hook'
                        )
                        .setRequired(
                            false
                        )
            )
            .addStringOption(
                (option) =>
                    option
                        .setName(
                            'dress'
                        )
                        .setDescription(
                            'Dress code'
                        )
                        .setRequired(
                            false
                        )
            )
            .addStringOption(
                (option) =>
                    option
                        .setName(
                            'note'
                        )
                        .setDescription(
                            'Extra note for guests'
                        )
                        .setRequired(
                            false
                        )
            )
            .addAttachmentOption(
                (option) =>
                    option
                        .setName(
                            'image'
                        )
                        .setDescription(
                            'Optional event image'
                        )
                        .setRequired(
                            false
                        )
            ),

    async execute(
        interaction
    ) {

        const timestamp =
            parseTimestamp(
                getOptionString(
                    interaction,
                    'when'
                )
            );

        if (
            !timestamp
        ) {

            await interaction.reply({
                content:
                    'I could not read that date. Use a Discord timestamp, Unix timestamp, or a clear date like `2026-06-20 20:00`.',
                flags:
                    64
            });

            return;

        }

        const host =
            interaction.options.getUser(
                'host'
            );

        const cohost =
            interaction.options.getUser(
                'cohost'
            );

        const pingRole =
            interaction.options.getRole(
                'ping'
            );

        const image =
            interaction.options.getAttachment(
                'image'
            );

        const theme =
            getOptionString(
                interaction,
                'theme'
            );

        const dress =
            getOptionString(
                interaction,
                'dress'
            );

        const note =
            getOptionString(
                interaction,
                'note'
            );

        const embed =
            createBotEmbed(
                interaction,
                {
                    command:
                        '/eventpost',
                    title:
                        getOptionString(
                            interaction,
                            'title'
                        ),
                    description:
                        theme || 'Private event announcement.',
                    image:
                        image?.url
                }
            );

        embed.addFields(
            {
                name:
                    '\uD83D\uDCC5 When',
                value:
                    formatTimestamp(
                        timestamp
                    ),
                inline:
                    true
            },
            {
                name:
                    '\uD83D\uDCCD Room',
                value:
                    getOptionString(
                        interaction,
                        'room'
                    ),
                inline:
                    true
            },
            {
                name:
                    '\uD83D\uDD11 Type',
                value:
                    getOptionString(
                        interaction,
                        'type'
                    ),
                inline:
                    true
            },
            {
                name:
                    '\uD83C\uDFA4 Hosted By',
                value:
                    cohost
                        ? `${host} / ${cohost}`
                        : `${host}`,
                inline:
                    false
            }
        );

        if (
            dress
        )
            embed.addFields({
                name:
                    '\uD83D\uDC57 Dress Code',
                value:
                    dress,
                inline:
                    true
            });

        if (
            note
        )
            embed.addFields({
                name:
                    '\uD83D\uDCDD Note',
                value:
                    note,
                inline:
                    false
            });

        const post =
            await interaction.channel.send({
                content:
                    pingRole
                        ? `${pingRole}`
                        : null,
                embeds: [
                    embed
                ],
                allowedMentions:
                    pingRole
                        ? {
                            roles: [
                                pingRole.id
                            ]
                        }
                        : {
                            parse: []
                        }
            });

        await interaction.reply({
            content:
                `Event posted: ${post.url}`,
            flags:
                64
        });

    }

};
