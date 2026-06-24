const {
    SlashCommandBuilder
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
    getGuildMembers
} = require('../../utils/memberCache');

const {
    trackDailyQuest
} = require('../../features/daily-quests/dailyQuests');

const ROLES =
    require('../../data/roles.json');

const vibes = [
    'dangerous chemistry',
    'slow-burn tension',
    'chaotic flirt energy',
    'too-curious-to-ignore energy',
    'private room potential',
    'unexpectedly strong chemistry'
];

function getGenderRole(
    member
) {

    if (
        member.roles.cache.has(
            ROLES.MALE
        )
    )
        return 'male';

    if (
        member.roles.cache.has(
            ROLES.FEMALE
        )
    )
        return 'female';

    return null;

}

function getRandomItem(
    items
) {

    return items[
        Math.floor(
            Math.random() * items.length
        )
    ];

}

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'matchme'
            )
            .setDescription(
                'Find a random opposite-gender match'
            ),

    async execute(
        interaction
    ) {

        if (
            await handleCooldown(
                interaction,
                interaction.commandName,
                COOLDOWNS.MATCHME
            )
        )
            return;

        const requesterGender =
            getGenderRole(
                interaction.member
            );

        if (
            !requesterGender
        ) {

            await interaction.reply({
                content:
                    'You need a gender role before using /matchme.',
                flags: 64
            });

            return;

        }

        const wantedRole =
            requesterGender === 'male'
                ? ROLES.FEMALE
                : ROLES.MALE;

        await interaction.deferReply();

        const members =
            await getGuildMembers(
                interaction.guild
            );

        const candidates =
            members.filter(
                (member) =>
                    !member.user.bot &&
                    member.id !== interaction.user.id &&
                    member.roles.cache.has(
                        wantedRole
                    )
            );

        if (
            candidates.size === 0
        ) {

            await interaction.editReply({
                content:
                    'I could not find an available opposite-gender match right now.'
            });

            return;

        }

        const match =
            candidates.random();

        const compatibility =
            Math.floor(
                Math.random() * 31
            ) + 70;

        const embed =
            createEmbed({
                color:
                    getRandomColor(),
                authorName:
                    interaction.member.displayName,
                authorIcon:
                    interaction.user.displayAvatarURL(),
                title:
                    'Match Found',
                description:
`<@${interaction.user.id}> matched with <@${match.id}>.

Compatibility: **${compatibility}%**
Vibe: **${getRandomItem(vibes)}**`,
                thumbnail:
                    match.user.displayAvatarURL(),
                footerText:
                    '/matchme - One match per day',
                timestamp:
                    true
            });

        await interaction.editReply({
            embeds: [
                embed
            ]
        });

        await trackDailyQuest(
            interaction.client,
            interaction.user.id,
            'matchme'
        );

    }

};
