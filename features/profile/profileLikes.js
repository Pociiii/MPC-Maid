const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');

const db =
    require('../../database/database');

const {
    CHANNELS,
    getRandomColor
} = require('../../data/constants');

const {
    fetchDisplayTarget,
    getDisplayName
} = require('../../utils/embeds');

const {
    postMoment
} = require('../../utils/moments');

const {
    setAchievementProgress
} = require('../achievements/achievements');

function dbGet(
    sql,
    params = []
) {

    return new Promise(
        (resolve, reject) =>
            db.get(
                sql,
                params,
                (error, row) =>
                    error
                        ? reject(
                            error
                        )
                        : resolve(
                            row
                        )
            )
    );

}

function dbRun(
    sql,
    params = []
) {

    return new Promise(
        (resolve, reject) =>
            db.run(
                sql,
                params,
                function(error) {
                    error
                        ? reject(
                            error
                        )
                        : resolve(
                            this
                        );
                }
            )
    );

}

async function getProfileLikeCount(
    targetUserId
) {

    const row =
        await dbGet(
            `SELECT COUNT(*) AS count
             FROM profile_likes
             WHERE target_user_id = ?`,
            [
                targetUserId
            ]
        );

    return Number(
        row?.count ?? 0
    );

}

async function hasProfileLike(
    targetUserId,
    likerUserId
) {

    const row =
        await dbGet(
            `SELECT 1 AS liked
             FROM profile_likes
             WHERE target_user_id = ?
             AND liker_user_id = ?`,
            [
                targetUserId,
                likerUserId
            ]
        );

    return Boolean(
        row
    );

}

async function addProfileLike(
    targetUserId,
    likerUserId
) {

    const result =
        await dbRun(
            `INSERT OR IGNORE INTO profile_likes (
                target_user_id,
                liker_user_id
            ) VALUES (?, ?)`,
            [
                targetUserId,
                likerUserId
            ]
        );

    const totalLikes =
        await getProfileLikeCount(
            targetUserId
        );

    return {
        added:
            result.changes > 0,
        totalLikes
    };

}

async function postProfileLikeMoment(
    client,
    {
        likerUserId,
        targetUserId,
        totalLikes
    }
) {

    const target =
        await fetchDisplayTarget(
            client,
            targetUserId
        );

    const liker =
        await fetchDisplayTarget(
            client,
            likerUserId
        );

    await postMoment(
        client,
        {
            color:
                getRandomColor(),
            channelId:
                CHANNELS.PILLOW_TALK,
            command:
                '/profile',
            content:
                `<@${targetUserId}>`,
            fields: [
                {
                    name:
                        'Liked By',
                    value:
                        `<@${likerUserId}>`,
                    inline:
                        true
                },
                {
                    name:
                        'Profile',
                    value:
                        `<@${targetUserId}>`,
                    inline:
                        true
                },
                {
                    name:
                        'Total Likes',
                    value:
                        String(
                            totalLikes
                        ),
                    inline:
                        true
                }
            ],
            flavor:
                `${getDisplayName(
                    liker
                )} liked ${getDisplayName(
                    target
                )}'s profile.`,
            thumbnail:
                target.displayAvatarURL?.(),
            title:
                'Profile Like'
        }
    );

}

function buildLikedComponents(
    targetUserId
) {

    return [
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `profile_like:${targetUserId}`
                    )
                    .setLabel(
                        'Liked'
                    )
                    .setStyle(
                        ButtonStyle.Secondary
                    )
                    .setDisabled(
                        true
                    )
            )
    ];

}

function updateProfileLikeEmbed(
    originalEmbed,
    totalLikes
) {

    const embed =
        EmbedBuilder.from(
            originalEmbed
        );

    const fields =
        (originalEmbed.fields ?? []).map(
            (field) =>
                field.name.includes(
                    'Profile Likes'
                )
                    ? {
                        name:
                            field.name,
                        value:
                            `- Total Likes: **${totalLikes}**`,
                        inline:
                            field.inline
                    }
                    : field
        );

    embed.setFields(
        fields
    );

    return embed;

}

async function handleProfileLike(
    interaction
) {

    const targetUserId =
        interaction.customId.split(
            ':'
        )[1];

    if (
        !targetUserId
    ) {

        await interaction.reply({
            content:
                'That profile like button is not valid anymore.',
            flags:
                64
        });

        return;

    }

    if (
        targetUserId === interaction.user.id
    ) {

        await interaction.reply({
            content:
                'You cannot like your own profile.',
            flags:
                64
        });

        return;

    }

    const result =
        await addProfileLike(
            targetUserId,
            interaction.user.id
        );

    if (
        !result.added
    ) {

        await interaction.reply({
            content:
                'You already liked this profile.',
            flags:
                64
        });

        return;

    }

    await postProfileLikeMoment(
        interaction.client,
        {
            likerUserId:
                interaction.user.id,
            targetUserId,
            totalLikes:
                result.totalLikes
        }
    ).catch(
        () => null
    );

    await setAchievementProgress(
        interaction.client,
        targetUserId,
        'profile_likes_received',
        result.totalLikes
    );

    const updatePayload = {
        components:
            buildLikedComponents(
                targetUserId
            )
    };

    if (
        interaction.message.embeds[0]
    )
        updatePayload.embeds = [
            updateProfileLikeEmbed(
                interaction.message.embeds[0],
                result.totalLikes
            )
        ];

    await interaction.update(
        updatePayload
    );

    await interaction.followUp({
        content:
            `You liked <@${targetUserId}>'s profile.`,
        flags:
            64
    });

}

module.exports = {
    addProfileLike,
    getProfileLikeCount,
    handleProfileLike,
    hasProfileLike,
    postProfileLikeMoment
};
