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
    CHANNELS,
    COOLDOWNS,
    getRandomColor
} = require('../../data/constants');

const {
    handleCooldown
} = require('../../utils/cooldowns');

const {
    getMemberCategory
} = require('../../utils/userCategory');

const {
    addPendingRequest,
    hasPendingRequest
} = require('../../utils/pornScenes');

function getSceneCategory(
    firstCategory,
    secondCategory
) {

    const categories =
        [
            firstCategory,
            secondCategory
        ];

    const maleCategory =
        categories.find(
            (category) =>
                category.endsWith(
                    'm'
                )
        );

    const femaleCategories =
        categories.filter(
            (category) =>
                category.endsWith(
                    'f'
                )
        );

    if (
        maleCategory &&
        femaleCategories.length === 1
    )
        return `${maleCategory}_${femaleCategories[0]}`;

    if (
        femaleCategories.length === 2
    ) {

        const uniqueCategories =
            [...new Set(
                femaleCategories
            )];

        return uniqueCategories.length === 1
            ? `${uniqueCategories[0]}_${uniqueCategories[0]}`
            : 'wf_bf';

    }

    return null;

}

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'pornscene'
            )
            .setDescription(
                'Request a porn career scene with another user'
            )
            .addUserOption(
                (option) =>
                    option
                        .setName(
                            'partner'
                        )
                        .setDescription(
                            'The user you want to make a scene with'
                        )
                        .setRequired(
                            true
                        )
            ),

    async execute(
        interaction
    ) {

        if (
            await handleCooldown(
                interaction,
                interaction.commandName,
                COOLDOWNS.PORN_SCENE_REQUEST
            )
        )
            return;

        const target =
            interaction.options.getUser(
                'partner'
            );

        if (
            target.bot
        ) {

            await interaction.reply({
                content:
                    'You cannot request a porn scene with a bot.',
                flags: 64
            });

            return;

        }

        if (
            target.id === interaction.user.id
        ) {

            await interaction.reply({
                content:
                    'You cannot request a porn scene with yourself.',
                flags: 64
            });

            return;

        }

        if (
            hasPendingRequest(
                interaction.user.id,
                target.id
            )
        ) {

            await interaction.reply({
                content:
                    'You already have a pending porn scene request with this user.',
                flags: 64
            });

            return;

        }

        const targetMember =
            await interaction.guild.members.fetch(
                target.id
            );

        let sceneCategory;

        try {

            sceneCategory =
                getSceneCategory(
                    getMemberCategory(
                        interaction.member
                    ),
                    getMemberCategory(
                        targetMember
                    )
                );

        }
        catch (error) {

            await interaction.reply({
                content:
                    `Missing role info: ${error.message}`,
                flags: 64
            });

            return;

        }

        if (
            !sceneCategory
        ) {

            await interaction.reply({
                content:
                    'No matching scene category exists for this role combination.',
                flags: 64
            });

            return;

        }

        const row =
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(
                            `pornscene_accept:${interaction.user.id}:${target.id}`
                        )
                        .setLabel(
                            'Accept'
                        )
                        .setStyle(
                            ButtonStyle.Success
                        ),
                    new ButtonBuilder()
                        .setCustomId(
                            `pornscene_decline:${interaction.user.id}:${target.id}`
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
                    'Porn Scene Request',
                description:
                    `<@${interaction.user.id}> wants to make a porn scene with you.`,
                footerText:
                    '/pornscene',
                timestamp:
                    true
            });

        try {

            const message =
                await target.send({
                    embeds: [embed],
                    components: [row]
                });

            addPendingRequest(
                interaction.user.id,
                target.id,
                {
                    channelId:
                        CHANNELS.PORN_CAREER,
                    messageId:
                        message.id,
                    sceneCategory
                }
            );

            const rumorsChannel =
                interaction.client.channels.cache.get(
                    CHANNELS.RUMORS
                ) ??
                await interaction.client.channels.fetch(
                    CHANNELS.RUMORS
                );

            if (
                rumorsChannel
            ) {

                await rumorsChannel.send({
                    embeds: [
                        createEmbed({
                            color:
                                getRandomColor(),
                            authorName:
                                interaction.member.displayName,
                            authorIcon:
                                interaction.user.displayAvatarURL(),
                            title:
                                'Porn Scene Rumor',
                            description:
                                `<@${interaction.user.id}> is talking scene with ${target}.`,
                            footerText:
                                '/pornscene',
                            timestamp:
                                true
                        })
                    ]
                });

            }

        }
        catch {

            await interaction.reply({
                content:
                    'I could not DM that user. They may have DMs closed.',
                flags: 64
            });

            return;

        }

        await interaction.reply({
            content:
                `Scene request sent to ${target}.`,
            flags: 64
        });

    }

};
