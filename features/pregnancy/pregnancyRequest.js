const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    getRandomColor
} = require('../../data/constants');

const {
    addDailyPartner,
    getActivePregnancy,
    getNextPregnancyCheckTimestamp
} = require('../../database/pregnancy');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    getBreedingRoles
} = require('../../utils/pregnancy');

const {
    postMoment
} = require('../../utils/moments');

const {
    buildBreedRequestEmbed
} = require('./pregnancyEmbeds');

const emojis =
    require('../../utils/emojis');

async function respond(
    interaction,
    payload
) {

    if (
        interaction.deferred ||
        interaction.replied
    ) {

        const {
            flags,
            ...editablePayload
        } = payload;

        return interaction.editReply(
            editablePayload
        );

    }

    return interaction.reply(
        payload
    );

}

function buildAcceptRows(
    requesterId,
    targetId,
    carrierId,
    partnerId
) {

    return [
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `breed_accept:${requesterId}:${targetId}:${carrierId}:${partnerId}`
                    )
                    .setLabel(
                        'Accept'
                    )
                    .setEmoji(
                        '\u2705'
                    )
                    .setStyle(
                        ButtonStyle.Success
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        `breed_decline:${requesterId}:${targetId}:${carrierId}:${partnerId}`
                    )
                    .setLabel(
                        'Decline'
                    )
                    .setEmoji(
                        '\u274C'
                    )
                    .setStyle(
                        ButtonStyle.Danger
                    )
            )
    ];

}

function buildCarrierChoiceRows(
    requesterId,
    targetId
) {

    return [
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `breed_carrier:${requesterId}:${targetId}:${requesterId}`
                    )
                    .setLabel(
                        'I Carry'
                    )
                    .setEmoji(
                        '\uD83E\uDD30'
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        `breed_carrier:${requesterId}:${targetId}:${targetId}`
                    )
                    .setLabel(
                        'They Carry'
                    )
                    .setEmoji(
                        '\uD83C\uDF38'
                    )
                    .setStyle(
                        ButtonStyle.Secondary
                    )
            )
    ];

}

async function sendBreedRequest(
    interaction,
    target,
    carrierId,
    partnerId,
    {
        confirm = true
    } = {}
) {

    const active =
        await getActivePregnancy(
            carrierId
        );

    if (
        active
    ) {

        await respond(
            interaction,
            {
            content:
                `<@${carrierId}> is already pregnant.`,
            flags:
                64
            }
        );

        return;

    }

    const embed =
        buildBreedRequestEmbed(
            interaction.user,
            carrierId,
            partnerId
        );

    await target.send({
        embeds: [
            embed
        ],
        components:
            buildAcceptRows(
                interaction.user.id,
                target.id,
                carrierId,
                partnerId
            )
    });

    if (
        confirm
    )
        await respond(
            interaction,
            {
            content:
                `Breed request sent to ${target}.`,
            flags:
                64
            }
        );

}

async function startBreedRequest(
    interaction,
    target
) {

    const targetMember =
        await interaction.guild.members.fetch(
            target.id
        );

    const roles =
        getBreedingRoles(
            interaction.member,
            targetMember
        );

    if (
        !roles.valid
    ) {

        await respond(
            interaction,
            {
            content:
                roles.reason,
            flags:
                64
            }
        );

        return;

    }

    if (
        roles.needsCarrierChoice
    ) {

        const embed =
            createEmbed({
                color:
                    getRandomColor(),
                title:
                    'Choose Carrier',
                description:
                    `Both of you can carry. Choose who this request is for.`,
                thumbnail:
                    interaction.user.displayAvatarURL(),
                footerText:
                    '/breed',
                timestamp:
                    true
            });

        await respond(
            interaction,
            {
            embeds: [
                embed
            ],
            components:
                buildCarrierChoiceRows(
                    interaction.user.id,
                    target.id
                ),
            flags:
                64
            }
        );

        return;

    }

    await sendBreedRequest(
        interaction,
        target,
        roles.carrierId,
        roles.partnerId
    );

}

async function handleCarrierChoice(
    interaction
) {

    const [
        ,
        requesterId,
        targetId,
        carrierId
    ] =
        interaction.customId.split(
            ':'
        );

    if (
        interaction.user.id !== requesterId
    ) {

        await interaction.reply({
            content:
                'This carrier choice belongs to someone else.',
            flags:
                64
        });

        return;

    }

    await interaction.deferUpdate();

    const target =
        await interaction.client.users.fetch(
            targetId
        );

    const targetMember =
        await interaction.guild.members.fetch(
            targetId
        );

    const roles =
        getBreedingRoles(
            interaction.member,
            targetMember,
            carrierId
        );

    if (
        !roles.valid
    ) {

        await interaction.editReply({
            content:
                roles.reason,
            embeds:
                [],
            components:
                []
        });

        return;

    }

    const active =
        await getActivePregnancy(
            roles.carrierId
        );

    if (
        active
    ) {

        await interaction.editReply({
            content:
                `<@${roles.carrierId}> is already pregnant.`,
            embeds:
                [],
            components:
                []
        });

        return;

    }

    await sendBreedRequest(
        interaction,
        target,
        roles.carrierId,
        roles.partnerId,
        {
            confirm:
                false
        }
    );

    await interaction.editReply({
        content:
            `Breed request sent to ${target}.`,
        embeds:
            [],
        components:
            []
    });

}

async function handleBreedDecision(
    interaction,
    accepted
) {

    const [
        ,
        requesterId,
        targetId,
        carrierId,
        partnerId
    ] =
        interaction.customId.split(
            ':'
        );

    if (
        interaction.user.id !== targetId
    ) {

        await interaction.reply({
            content:
                'This breed request is not for you.',
            flags:
                64
        });

        return;

    }

    await interaction.deferUpdate();

    if (
        !accepted
    ) {

        await interaction.editReply({
            content:
                'Breed request declined.',
            embeds:
                [],
            components:
                []
        });

        return;

    }

    const active =
        await getActivePregnancy(
            carrierId
        );

    if (
        active
    ) {

        await interaction.editReply({
            content:
                `<@${carrierId}> is already pregnant.`,
            embeds:
                [],
            components:
                []
        });

        return;

    }

    const result =
        await addDailyPartner(
            carrierId,
            partnerId
        );

    const nextCheck =
        getNextPregnancyCheckTimestamp();

    await interaction.editReply({
        content:
            result.added
                ? `Accepted. <@${partnerId}> was added to <@${carrierId}>'s partner list for today.`
                : `<@${partnerId}> is already on <@${carrierId}>'s partner list for today.`,
        embeds:
            [],
        components:
            []
    });

    if (
        result.added
    ) {

        await postMoment(
            interaction.client,
            {
                type:
                    'breed_accepted',
                color:
                    getRandomColor(),
                title:
                    `${emojis.breed} Breed Accepted`,
                flavor:
`<@${requesterId}> and <@${targetId}> spent some private time together.`,
                command:
                    '/breed',
                fields: [
                    {
                        name:
                            '\uD83E\uDD30 Carrier',
                        value:
                            `<@${carrierId}>`,
                        inline:
                            true
                    },
                    {
                        name:
                            '\u23F3 Next Check',
                        value:
                            `<t:${nextCheck}:F>\n<t:${nextCheck}:R>`,
                        inline:
                            true
                    }
                ]
            }
        );

    }

}

module.exports = {
    handleBreedDecision,
    handleCarrierChoice,
    startBreedRequest
};
