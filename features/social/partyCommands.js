const {
    getRandomColor
} = require('../../data/constants');

const {
    createUserEmbed,
    fetchDisplayTarget,
    getDisplayAvatar,
    getDisplayName
} = require('../../utils/embeds');

const {
    getRandomGif
} = require('../../utils/gifs');

const {
    postMoment
} = require('../../utils/moments');

async function getVisibleOnlineMembers(
    interaction
) {

    const guild =
        interaction.guild;

    if (
        guild
    )
        await guild.members.fetch({
            withPresences:
                true
        }).catch(
            () => null
        );

    const members =
        new Map();

    if (
        interaction.member &&
        !interaction.member.user.bot
    )
        members.set(
            interaction.member.id,
            interaction.member
        );

    for (
        const presence of interaction.guild?.presences.cache.values() ?? []
    ) {

        const member =
            presence.member ??
            guild?.members.cache.get(
                presence.userId
            );

        if (
            !member ||
            member.user.bot ||
            presence.status === 'offline'
        )
            continue;

        members.set(
            member.id,
            member
        );

    }

    return [
        ...members.values()
    ];

}

function getCommandGif(
    category,
    userIds
) {

    const result =
        getRandomGif(
            category,
            userIds
        );

    return {
        footerDetail:
            result.total > 0
                ? `GIF #${result.index}/${result.total}`
                : 'GIF pool empty',
        image:
            result.url
    };

}

function buildDrinkEmbed(
    interaction,
    {
        cost,
        gif,
        recipientCount,
        xpReward
    }
) {

    const embed =
        createUserEmbed(
            interaction,
            {
                color:
                    getRandomColor(),
                command:
                    '/drink',
                description:
                    `<@${interaction.user.id}> bought a round for everyone online.`,
                footerDetail:
                    gif.footerDetail,
                image:
                    gif.image,
                title:
                    '\uD83C\uDF79 Drinks Around'
            }
        );

    embed.addFields(
        {
            name:
                '\uD83C\uDF79 Host',
            value:
                `<@${interaction.user.id}>`,
            inline:
                true
        },
        {
            name:
                '\u2B50 XP Shared',
            value:
                `+${xpReward} XP each`,
            inline:
                true
        },
        {
            name:
                '\uD83D\uDC65 Served',
            value:
                `${recipientCount} online member${recipientCount === 1 ? '' : 's'}`,
            inline:
                true
        },
        {
            name:
                '\uD83E\uDE99 Cost',
            value:
                `${cost} coins`,
            inline:
                true
        }
    );

    return embed;

}

function buildFireworkEmbed(
    interaction,
    {
        cost,
        gif,
        message
    }
) {

    const flexText =
        message ||
        'The room gets a little louder, brighter, and harder to ignore.';

    const embed =
        createUserEmbed(
            interaction,
            {
                color:
                    getRandomColor(),
                command:
                    '/firework',
                description:
                    `<@${interaction.user.id}> lit up the room.\n\n${flexText}`,
                footerDetail:
                    gif.footerDetail,
                image:
                    gif.image,
                title:
                    '\uD83C\uDF86 Firework Flex'
            }
        );

    embed.addFields(
        {
            name:
                '\uD83C\uDF86 Fired By',
            value:
                `<@${interaction.user.id}>`,
            inline:
                true
        },
        {
            name:
                '\uD83E\uDE99 Burned',
            value:
                `${cost} coins`,
            inline:
                true
        },
        {
            name:
                '\u2728 Reward',
            value:
                'Pure flex',
            inline:
                true
        }
    );

    return embed;

}

async function getPartyMomentTarget(
    interaction
) {

    return interaction.member ??
        await fetchDisplayTarget(
            interaction.client,
            interaction.user.id,
            interaction.guildId
        );

}

async function postDrinkMoment(
    interaction,
    {
        gif,
        recipientCount,
        xpReward
    }
) {

    const target =
        await getPartyMomentTarget(
            interaction
        );

    const avatar =
        getDisplayAvatar(
            target
        );

    return postMoment(
        interaction.client,
        {
            type:
                'party_drink',
            color:
                getRandomColor(),
            command:
                '/drink',
            authorName:
                getDisplayName(
                    target
                ),
            thumbnail:
                avatar,
            image:
                gif.image,
            title:
                '\uD83C\uDF79 Drinks Around',
            fields: [
                {
                    name:
                        '\uD83C\uDF79 Host',
                    value:
                        `<@${interaction.user.id}>`,
                    inline:
                        true
                },
                {
                    name:
                        '\uD83D\uDC65 Served',
                    value:
                        `${recipientCount} online member${recipientCount === 1 ? '' : 's'}`,
                    inline:
                        true
                },
                {
                    name:
                        '\u2B50 XP Shared',
                    value:
                        `+${xpReward} XP each`,
                    inline:
                        true
                }
            ]
        }
    );

}

async function postFireworkMoment(
    interaction,
    {
        cost,
        gif,
        message
    }
) {

    const target =
        await getPartyMomentTarget(
            interaction
        );

    const avatar =
        getDisplayAvatar(
            target
        );

    const fields = [
        {
            name:
                '\uD83C\uDF86 Launched By',
            value:
                `<@${interaction.user.id}>`,
            inline:
                true
        },
        {
            name:
                '\uD83E\uDE99 Burned',
            value:
                `${cost} coins`,
            inline:
                true
        }
    ];

    if (
        message
    )
        fields.push({
            name:
                '\uD83D\uDCDD Message',
            value:
                message,
            inline:
                false
        });

    return postMoment(
        interaction.client,
        {
            type:
                'party_firework',
            color:
                getRandomColor(),
            command:
                '/firework',
            authorName:
                getDisplayName(
                    target
                ),
            thumbnail:
                avatar,
            image:
                gif.image,
            title:
                '\uD83C\uDF86 Firework Flex',
            fields
        }
    );

}

module.exports = {
    buildDrinkEmbed,
    buildFireworkEmbed,
    getCommandGif,
    getVisibleOnlineMembers,
    postDrinkMoment,
    postFireworkMoment
};
