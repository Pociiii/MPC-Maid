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
    getRelationshipData
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

            ),

    async execute(
        interaction
    ) {

        const subcommand =
            interaction.options.getSubcommand();

        if (
            subcommand === 'view'
        ) {

            await getOrCreateUser(
                interaction.user.id
            );

            const relationships =
                await getRelationshipData(
                    interaction.user.id
                );

            let partner =
                'None';

            if (
                relationships.partner_id
            ) {

                try {

                    const partnerUser =
                        await interaction.client.users.fetch(
                            relationships.partner_id
                        );

                    partner =
                        partnerUser.displayName ||
                        partnerUser.username;

                }
                catch {}

            }

            const embed =
                createEmbed({

                    color:
                        getRandomColor(),

                    authorName:
                        interaction.member.displayName,

                    authorIcon:
                        interaction.user.displayAvatarURL(),

                    title:
                        '❤️ Relationships',

                    description:
                        `**Partner**\n${partner}`,

                    timestamp:
                        true

                });

            return interaction.reply({

                embeds: [embed]

            });

        }

        if (
            subcommand === 'partner'
        ) {

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
                        '❌ You cannot partner yourself.',

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

                                `relationship_accept:partner:${interaction.user.id}`

                            )

                            .setLabel(
                                'Accept'
                            )

                            .setStyle(
                                ButtonStyle.Success
                            ),

                        new ButtonBuilder()

                            .setCustomId(

                                `relationship_decline:partner:${interaction.user.id}`

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
                        `${interaction.user.username} wants to add you as their partner.`,

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
                        `❤️ Partner request sent to ${target.username}.`,

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