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
    hasPendingRequest
} = require('../../utils/pornScenes');

const {
    boosterStatLabels,
    formatBoosterSelectDescription,
    getUserBoosters
} = require('../../utils/boosters');

const {
    getOrCreateUser
} = require('../../utils/users');

const {
    getRankTitle
} = require('../../utils/ranks');

const {
    formatPornCareerName
} = require('../../utils/pornCareerTitles');

const {
    adpLogoPath,
    adpLogoAttachment
} = require('../../utils/adpLogo');

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

        const boosters =
            await getUserBoosters(
                interaction.user.id
            );

        const requesterUser =
            await getOrCreateUser(
                interaction.user.id
            );

        const requesterRank =
            getRankTitle(
                requesterUser.ranking
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
                        requesterRank
                    ),
                authorIcon:
                    adpLogoAttachment,
                title:
                    'Choose Scene Booster',
                description:
                    `Pick one booster to spend now for the request with ${target}, or choose no booster.`,
                thumbnail:
                    interaction.user.displayAvatarURL(),
                footerText:
                    '/pornscene',
                timestamp:
                    true
            });

        await interaction.reply({
            embeds: [
                embed
            ],
            components: [
                row
            ],
            files: [
                adpLogoPath
            ],
            flags:
                64
        });

    }

};
