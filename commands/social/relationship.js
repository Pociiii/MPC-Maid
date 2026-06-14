const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    getRandomColor
} = require('../../data/constants');

const {
    getRelationshipData, getUserName
} = require('../../utils/relationships');

const {
    getOrCreateUser
} = require('../../utils/users');


module.exports = {

    data:
        new SlashCommandBuilder()

            .setName('relationship')

            .setDescription(
                'Manage relationships'
            )

            .addSubcommand(sub =>

                sub

                    .setName('view')

                    .setDescription(
                        'View relationships'
                    )

                    .addUserOption(option =>

                        option

                            .setName('user')

                            .setDescription(
                                'Target user'
                            )

                            .setRequired(false)

                    )

            )

            .addSubcommand(sub =>

                sub

                    .setName('partner')

                    .setDescription(
                        'Request a partner'
                    )

                    .addUserOption(option =>

                        option

                            .setName('user')

                            .setDescription(
                                'Target user'
                            )

                            .setRequired(true)

                    )

            )

            .addSubcommand(sub =>

            sub

                .setName('mother')

                .setDescription(
                    'Request a mother'
                )

                .addUserOption(option =>

                    option

                        .setName('user')

                        .setDescription(
                            'Target user'
                        )

                        .setRequired(true)

                )

        )

        .addSubcommand(sub =>

            sub

                .setName('father')

                .setDescription(
                    'Request a father'
                )

                .addUserOption(option =>

                    option

                        .setName('user')

                        .setDescription(
                            'Target user'
                        )

                        .setRequired(true)

                )

        ),

    async execute(interaction) {

        const subcommand =
            interaction.options.getSubcommand();

        //
        // VIEW
        //
        if (subcommand === 'view') {

            const target =
                interaction.options.getUser(
                    'user'
                ) || interaction.user;

            await getOrCreateUser(
                target.id
            );

            const relationships =
                await getRelationshipData(
                    target.id
                );

            const partner =
                await getUserName(
                    interaction.client,
                    relationships.partner_id
                );

            const mother =
                await getUserName(
                    interaction.client,
                    relationships.mother_id
                );

            const father =
                await getUserName(
                    interaction.client,
                    relationships.father_id
                );

            const embed =
                createEmbed({

                    color:
                        getRandomColor(),

                    authorName:
                        target.displayName ||
                        target.username,

                    authorIcon:
                        target.displayAvatarURL(),

                    title:
                        `Relationships`,

                    description:

    `❤️ **Partner**: ${partner || 'None'}

    👩 **Mother**: ${mother || 'Unknown'}

    👨 **Father**: ${father || 'Unknown'}`,

                    timestamp:
                        true

                });

            return interaction.reply({

                embeds: [embed]

            });

        }

        //
        // REQUESTS
        //
        if (

            subcommand === 'partner' ||

            subcommand === 'mother' ||

            subcommand === 'father'

        ) {

            const relationshipType =
                subcommand;

            const target =
                interaction.options.getUser(
                    'user'
                );

            if (
                target.id ===
                interaction.user.id
            ) {

                return interaction.reply({

                    content:
                        '❌ You cannot target yourself.',

                    flags: 64

                });

            }

            await getOrCreateUser(
                interaction.user.id
            );

            await getOrCreateUser(
                target.id
            );

            const row =
                new ActionRowBuilder()

                    .addComponents(

                        new ButtonBuilder()

                            .setCustomId(

                                `relationship_accept:${relationshipType}:${interaction.user.id}`

                            )

                            .setLabel(
                                'Accept'
                            )

                            .setStyle(
                                ButtonStyle.Success
                            ),

                        new ButtonBuilder()

                            .setCustomId(

                                `relationship_decline:${relationshipType}:${interaction.user.id}`

                            )

                            .setLabel(
                                'Decline'
                            )

                            .setStyle(
                                ButtonStyle.Danger
                            )

                    );

            const embed =
                createEmbed({

                    color:
                        getRandomColor(),

                    title:
                        '❤️ Relationship Request',

                    description:
                        `${interaction.member.displayName} wants to add you as their ${relationshipType}.`,

                    timestamp:
                        true

                });

            try {

                await target.send({

                    embeds: [embed],

                    components: [row]

                });

                return interaction.reply({

                    content:
                        `❤️ ${relationshipType} request sent to ${target.username}.`,

                    flags: 64

                });

            }

            catch {

                return interaction.reply({

                    content:
                        '❌ Unable to send DM.',

                    flags: 64

                });

            }

        }

    }

};