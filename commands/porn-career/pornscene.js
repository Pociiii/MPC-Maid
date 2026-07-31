const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');

const {
    createEmbed
} = require('../../utils/embeds');

const {
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
    hasPendingRequest,
    isBusy
} = require('../../utils/pornScenes');

const {
    hasActiveStudioNpc
} = require('../../database/studios');

const {
    boosterStatLabels,
    formatBoosterSelectDescription,
    getUserBoosters
} = require('../../utils/boosters');

const {
    getOrCreateUser
} = require('../../utils/users');

const {
    formatPornCareerName
} = require('../../utils/pornCareerTitles');

const {
    mpcLogoAttachment
} = require('../../utils/mpcLogo');

const {
    getSceneCategoryName,
    getTwoPersonSceneCategory
} = require('../../features/porn-career/sceneCommon');

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

        await interaction.deferReply({
            flags:
                64
        });

        const target =
            interaction.options.getUser(
                'partner'
            );

        if (
            target.bot
        ) {

            await interaction.editReply({
                content:
                    'You cannot request a porn scene with a bot.'
            });

            return;

        }

        if (
            target.id === interaction.user.id
        ) {

            await interaction.editReply({
                content:
                    'You cannot request a porn scene with yourself.'
            });

            return;

        }

        if (
            hasPendingRequest(
                interaction.user.id,
                target.id
            )
        ) {

            await interaction.editReply({
                content:
                    'You already have a pending porn scene request with this user.'
            });

            return;

        }

        if (
            isBusy(
                interaction.user.id
            ) &&
            !await hasActiveStudioNpc(
                interaction.user.id,
                'personal_agent'
            )
        ) {

            await interaction.editReply({
                content:
                    'You are already filming another scene. Finish it before sending a new request.'
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
                getTwoPersonSceneCategory(
                    getMemberCategory(
                        interaction.member
                    ),
                    getMemberCategory(
                        targetMember
                    )
                );

        }
        catch (error) {

            await interaction.editReply({
                content:
                    `Missing role info: ${error.message}`
            });

            return;

        }

        if (
            !sceneCategory
        ) {

            await interaction.editReply({
                content:
                    'No matching scene category exists for this role combination.'
            });

            return;

        }

        if (
            await handleCooldown(
                interaction,
                interaction.commandName,
                COOLDOWNS.PORN_SCENE_REQUEST
            )
        )
            return;

        const boosters =
            await getUserBoosters(
                interaction.user.id
            );

        const requesterUser =
            await getOrCreateUser(
                interaction.user.id
            );

        const options = [
            {
                label:
                    'No booster',
                description:
                    'Send the request without spending a booster.',
                value:
                    'none'
            },
            ...boosters.map(
                (booster) => ({
                    label:
                        `${boosterStatLabels[booster.stat]} T${booster.tier}`,
                    description:
                        formatBoosterSelectDescription(
                            booster
                        ),
                    value:
                        `${booster.stat}:${booster.tier}`
                })
            )
        ];

        const row =
            new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(
                            `pornscene_booster:${target.id}:${sceneCategory}`
                        )
                        .setPlaceholder(
                            'Choose a booster for this scene'
                        )
                        .addOptions(
                            options
                        )
                );

        const embed =
            createEmbed({
                color:
                    getRandomColor(),
                authorName:
                    formatPornCareerName(
                        interaction.member.displayName,
                        requesterUser,
                        interaction.member
                    ),
                authorIcon:
                    mpcLogoAttachment,
                title:
                    'Choose Scene Booster',
                description:
                    'Pick one booster to spend now, or send the request clean.',
                thumbnail:
                    interaction.user.displayAvatarURL(),
                footerText:
                    '/pornscene',
                timestamp:
                    true
            });

        embed.addFields(
            {
                name:
                    '\uD83D\uDC65 Cast',
                value:
                    `<@${interaction.user.id}> + ${target}\n${getSceneCategoryName(
                        sceneCategory
                    )}`,
                inline:
                    false
            },
            {
                name:
                    '\uD83D\uDE80 Booster',
                value:
                    'Choose from the menu below.',
                inline:
                    false
            }
        );

        await interaction.editReply({
            embeds: [
                embed
            ],
            components: [
                row
            ]
        });

    }

};
