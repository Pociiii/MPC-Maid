const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder
} = require('discord.js');

const {
    getRandomColor
} = require('../../data/constants');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    commandFooter
} = require('../../utils/version');

const {
    mpc_logo
} = require('../../utils/emojis');

const {
    postMoment
} = require('../../utils/moments');

const {
    assertNoFamilyRelationshipBetween,
    createRelationshipRequest,
    countBesties,
    formatDate,
    getRelationshipsForUser,
    getParentTypeForMember,
    getRomanticLabelForTarget,
    hasParent,
    hasSpouse,
    parseRelationshipDate,
    relationshipExists,
    removeRelationship,
    setRelationshipRequestStatus
} = require('../../utils/relationships');

const requestTypeBySubcommand = {
    adopt:
        'adopt',
    sibling:
        'sibling',
    marry:
        'marriage',
    date:
        'dating',
    bestie:
        'bestie'
};

function userMention(
    userId
) {

    return `<@${userId}>`;

}

function bulletLine(
    label,
    value
) {

    return `- ${label}: ${value}`;

}

function bulletLineList(
    label,
    values
) {

    return [
        bulletLine(
            label,
            values.length > 0
                ? values.join(
                    ', '
                )
                : 'None'
        )
    ];

}

function otherUserId(
    relationship,
    userId
) {

    return relationship.user_a_id === userId
        ? relationship.user_b_id
        : relationship.user_a_id;

}

function relationshipLinkLabel(
    type
) {

    if (
        type === 'mother'
    )
        return 'Mother / Child';

    if (
        type === 'father'
    )
        return 'Father / Child';

    if (
        type === 'sibling'
    )
        return 'Siblings';

    if (
        type === 'marriage'
    )
        return 'Marriage';

    if (
        type === 'dating'
    )
        return 'Dating';

    if (
        type === 'bestie'
    )
        return 'Besties';

    return 'Relationship';

}

async function fetchMemberOrNull(
    guild,
    userId
) {

    return guild.members.fetch(
        userId
    ).catch(
        () => null
    );

}

async function formatRomanticLine(
    relationship,
    userId
) {

    const targetId =
        otherUserId(
            relationship,
            userId
        );

    const since =
        relationship.started_at
            ? ` (since ${formatDate(
                relationship.started_at
            )})`
            : '';

    return `${userMention(
        targetId
    )}${since}`;

}

function displayNameFor(
    target
) {

    return target.displayName ??
        target.globalName ??
        target.username ??
        'Unknown User';

}

async function romanticLabelForRelationship(
    interaction,
    relationship,
    userId,
    fallback
) {

    const targetMember =
        await fetchMemberOrNull(
            interaction.guild,
            otherUserId(
                relationship,
                userId
            )
        );

    if (
        !targetMember
    )
        return fallback;

    try {

        return getRomanticLabelForTarget(
            targetMember,
            relationship.type
        );

    }
    catch {

        return fallback;

    }

}

async function buildRelationshipEmbed(
    interaction,
    target
) {

    const rows =
        await getRelationshipsForUser(
            target.id
        );

    const mother =
        rows.find(
            (row) =>
                row.type === 'mother' &&
                row.user_b_id === target.id
        );

    const father =
        rows.find(
            (row) =>
                row.type === 'father' &&
                row.user_b_id === target.id
        );

    const children =
        rows
            .filter(
                (row) =>
                    [
                        'mother',
                        'father'
                    ].includes(
                        row.type
                    ) &&
                    row.user_a_id === target.id
            )
            .map(
                (row) =>
                    userMention(
                        row.user_b_id
                    )
            );

    const siblings =
        rows
            .filter(
                (row) =>
                    row.type === 'sibling'
            )
            .map(
                (row) =>
                    userMention(
                        otherUserId(
                            row,
                            target.id
                        )
                    )
            );

    const marriage =
        rows.find(
            (row) =>
                row.type === 'marriage'
        );

    const dating =
        rows.filter(
            (row) =>
                row.type === 'dating'
        );

    const besties =
        rows
            .filter(
                (row) =>
                    row.type === 'bestie'
            )
            .map(
                (row) =>
                    userMention(
                        otherUserId(
                            row,
                            target.id
                        )
                    )
            );

    const datingGroups = {};

    for (
        const row of dating
    ) {

        const label =
            await romanticLabelForRelationship(
                interaction,
                row,
                target.id,
                'Girlfriend / Boyfriend'
            );

        datingGroups[label] ??=
            [];

        datingGroups[label].push(
            await formatRomanticLine(
                row,
                target.id
            )
        );

    }

    const datingLines =
        Object.entries(
            datingGroups
        ).flatMap(
            ([
                label,
                values
            ]) =>
                bulletLineList(
                    label,
                    values
                )
        );

    const marriageLabel =
        marriage
            ? await romanticLabelForRelationship(
                interaction,
                marriage,
                target.id,
                'Spouse'
            )
            : 'Spouse';

    const marriageLine =
        marriage
            ? await formatRomanticLine(
                marriage,
                target.id
            )
            : 'None';

    const familyLines = [
        bulletLine(
            'Mother',
            mother
                ? userMention(
                    mother.user_a_id
                )
                : 'None'
        ),
        bulletLine(
            'Father',
            father
                ? userMention(
                    father.user_a_id
                )
                : 'None'
        ),
        ...bulletLineList(
            'Child',
            children
        ),
        ...bulletLineList(
            'Sibling',
            siblings
        )
    ];

    const romanticLines = [
        bulletLine(
            marriageLabel,
            marriageLine
        ),
        ...(
            datingLines.length > 0
                ? datingLines
                : [
                    bulletLine(
                        'Girlfriend / Boyfriend',
                        'None'
                    )
                ]
        )
    ];

    const socialLines = [
        ...bulletLineList(
            'Bestie',
            besties
        )
    ];

    const targetName =
        displayNameFor(
            target
        );

    const embed =
        createEmbed({
            color:
                getRandomColor(),
            authorName:
                targetName,
            authorIcon:
                target.displayAvatarURL(),
            thumbnail:
                target.displayAvatarURL(),
            title:
                `${targetName}'s Relationships`,
            description:
                'Current RP links. Relationship links are flavor only and do not affect porn career progress.',
            footerText:
                commandFooter(
                    '/relationship',
                    'Only exact links are removed'
                ),
            timestamp:
                true
        });

    embed.addFields(
        {
            name:
                'Family',
            value:
                familyLines.join(
                    '\n'
                ),
            inline:
                false
        },
        {
            name:
                'Romance',
            value:
                romanticLines.join(
                    '\n'
                ),
            inline:
                false
        },
        {
            name:
                'Social',
            value:
                socialLines.join(
                    '\n'
                ),
            inline:
                false
        }
    );

    return embed;

}

function buildRequestRows(
    requestId
) {

    return [
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `relationship_accept:${requestId}`
                    )
                    .setLabel(
                        'Accept'
                    )
                    .setStyle(
                        ButtonStyle.Success
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        `relationship_decline:${requestId}`
                    )
                    .setLabel(
                        'Decline'
                    )
                    .setStyle(
                        ButtonStyle.Danger
                    )
            )
    ];

}

function getDateOptions(
    interaction
) {

    return parseRelationshipDate(
        interaction.options.getInteger(
            'day'
        ),
        interaction.options.getInteger(
            'month'
        ),
        interaction.options.getInteger(
            'year'
        )
    );

}

function getRequestCopy(
    type,
    requester,
    roleLabel,
    startedAt
) {

    if (
        type === 'adopt'
    )
        return {
            description:
                `${requester} wants to adopt you as their child.`,
            fields: [
                {
                    name:
                        'Role',
                    value:
                        roleLabel,
                    inline:
                        true
                }
            ]
        };

    if (
        type === 'sibling'
    )
        return {
            description:
                `${requester} wants to become your sibling.`,
            fields:
                []
        };

    if (
        type === 'marriage'
    )
        return {
            description:
                `${requester} wants to marry you.`,
            fields: [
                {
                    name:
                        'Anniversary',
                    value:
                        formatDate(
                            startedAt
                        ),
                    inline:
                        true
                }
            ]
        };

    if (
        type === 'dating'
    )
        return {
            description:
                `${requester} wants to date you.`,
            fields: [
                {
                    name:
                        'Started',
                    value:
                        formatDate(
                            startedAt
                        ),
                    inline:
                        true
                }
            ]
        };

    return {
        description:
            `${requester} wants to become one of your Besties.`,
        fields:
            []
    };

}

async function validateRequestStart(
    interaction,
    type,
    target,
    targetMember,
    startedAt
) {

    if (
        target.bot
    )
        throw new Error(
            'You cannot create relationships with bots.'
        );

    if (
        target.id === interaction.user.id
    )
        throw new Error(
            'You cannot target yourself.'
        );

    if (
        type === 'adopt'
    ) {

        await assertNoFamilyRelationshipBetween(
            interaction.user.id,
            target.id
        );

        const parentType =
            getParentTypeForMember(
                interaction.member
            );

        if (
            await hasParent(
                target.id,
                parentType
            )
        )
            throw new Error(
                `That user already has a ${parentType}.`
            );

        return parentType === 'mother'
            ? 'Mother'
            : 'Father';

    }

    if (
        type === 'marriage'
    ) {

        getRomanticLabelForTarget(
            interaction.member,
            type
        );

        getRomanticLabelForTarget(
            targetMember,
            type
        );

        if (
            await hasSpouse(
                interaction.user.id
            ) ||
            await hasSpouse(
                target.id
            )
        )
            throw new Error(
                'One of you is already married.'
            );

    }

    if (
        type === 'dating'
    ) {

        getRomanticLabelForTarget(
            interaction.member,
            type
        );

        getRomanticLabelForTarget(
            targetMember,
            type
        );

        if (
            await relationshipExists(
                'dating',
                interaction.user.id,
                target.id
            )
        )
            throw new Error(
                'You are already dating that user.'
            );

    }

    if (
        type === 'sibling'
    ) {

        await assertNoFamilyRelationshipBetween(
            interaction.user.id,
            target.id
        );

    }

    if (
        type === 'bestie'
    ) {

        if (
            await relationshipExists(
                'bestie',
                interaction.user.id,
                target.id
            )
        )
            throw new Error(
                'You are already Besties with that user.'
            );

        if (
            await countBesties(
                interaction.user.id
            ) >= 3 ||
            await countBesties(
                target.id
            ) >= 3
        )
            throw new Error(
                'One of you already has 3 Besties.'
            );

    }

    return null;

}

async function sendRelationshipRequest(
    interaction,
    type,
    target,
    startedAt = null
) {

    const targetMember =
        await interaction.guild.members.fetch(
            target.id
        );

    const roleLabel =
        await validateRequestStart(
            interaction,
            type,
            target,
            targetMember,
            startedAt
        );

    const requestId =
        await createRelationshipRequest(
            interaction.guild.id,
            interaction.user.id,
            target.id,
            type,
            startedAt
        );

    const copy =
        getRequestCopy(
            type,
            interaction.user,
            roleLabel,
            startedAt
        );

    const embed =
        createEmbed({
            color:
                getRandomColor(),
            authorName:
                interaction.member.displayName,
            authorIcon:
                interaction.user.displayAvatarURL(),
            thumbnail:
                interaction.user.displayAvatarURL(),
            title:
                'Relationship Request',
            description:
                copy.description,
            footerText:
                commandFooter(
                    '/relationship'
                ),
            timestamp:
                true
        });

    if (
        copy.fields.length
    )
        embed.addFields(
            ...copy.fields
        );

    try {

        await target.send({
            embeds: [
                embed
            ],
            components:
                buildRequestRows(
                    requestId
                )
        });

    }
    catch {

        await setRelationshipRequestStatus(
            requestId,
            'failed'
        );

        throw new Error(
            'I could not send that user a DM.'
        );

    }

    await interaction.reply({
        content:
            `Relationship request sent to ${target}.`,
        flags:
            64
    });

}

async function removeOrReply(
    interaction,
    type,
    firstId,
    secondId,
    successText,
    failureText,
    linkLabel = relationshipLinkLabel(
        type
    )
) {

    const removed =
        await removeRelationship(
            type,
            firstId,
            secondId
        );

    await interaction.reply({
        content:
            removed
                ? successText
                : failureText,
        flags:
            64
    });

    if (
        removed
    )
        await postRelationshipBrokenMoment(
            interaction,
            firstId,
            secondId,
            linkLabel
        );

}

async function postRelationshipBrokenMoment(
    interaction,
    firstId,
    secondId,
    linkLabel
) {

    const firstMember =
        await fetchMemberOrNull(
            interaction.guild,
            firstId
        );

    const secondMember =
        await fetchMemberOrNull(
            interaction.guild,
            secondId
        );

    const authorName =
        firstMember?.displayName ??
        interaction.member.displayName;

    const authorIcon =
        firstMember?.user.displayAvatarURL() ??
        interaction.user.displayAvatarURL();

    const thumbnail =
        secondMember?.user.displayAvatarURL() ??
        interaction.user.displayAvatarURL();

    await postMoment(
        interaction.client,
        {
            type:
                'relationship_broken',
            color:
                getRandomColor(),
            authorName,
            authorIcon,
            thumbnail,
            title:
                `${mpc_logo} Moment`,
            flavor:
                `${userMention(
                    firstId
                )} and ${userMention(
                    secondId
                )} are no longer linked.`,
            command:
                '/relationship',
            fields: [
                {
                    name:
                        'Bond',
                    value:
                        linkLabel,
                    inline:
                        true
                }
            ]
        }
    ).catch(
        (error) =>
            console.error(
                'RELATIONSHIP MOMENT ERROR',
                error
            )
    );

}

function addDateOptions(
    subcommand
) {

    return subcommand
        .addIntegerOption(
            (option) =>
                option
                    .setName(
                        'day'
                    )
                    .setDescription(
                        'Start day'
                    )
                    .setMinValue(
                        1
                    )
                    .setMaxValue(
                        31
                    )
                    .setRequired(
                        false
                    )
        )
        .addIntegerOption(
            (option) =>
                option
                    .setName(
                        'month'
                    )
                    .setDescription(
                        'Start month'
                    )
                    .setMinValue(
                        1
                    )
                    .setMaxValue(
                        12
                    )
                    .setRequired(
                        false
                    )
        )
        .addIntegerOption(
            (option) =>
                option
                    .setName(
                        'year'
                    )
                    .setDescription(
                        'Start year'
                    )
                    .setMinValue(
                        2020
                    )
                    .setRequired(
                        false
                    )
        );

}

function userOption(
    name,
    description
) {

    return (option) =>
        option
            .setName(
                name
            )
            .setDescription(
                description
            )
            .setRequired(
                true
            );

}

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'relationship'
            )
            .setDescription(
                'Manage RP relationships'
            )
            .addSubcommand(
                (subcommand) =>
                    subcommand
                        .setName(
                            'view'
                        )
                        .setDescription(
                            'View relationships'
                        )
                        .addUserOption(
                            (option) =>
                                option
                                    .setName(
                                        'user'
                                    )
                                    .setDescription(
                                        'User to view'
                                    )
                                    .setRequired(
                                        true
                                    )
                        )
            )
            .addSubcommand(
                (subcommand) =>
                    subcommand
                        .setName(
                            'adopt'
                        )
                        .setDescription(
                            'Ask someone to become your child'
                        )
                        .addUserOption(
                            userOption(
                                'child',
                                'User to adopt'
                            )
                        )
            )
            .addSubcommand(
                (subcommand) =>
                    subcommand
                        .setName(
                            'abandon'
                        )
                        .setDescription(
                            'Remove one of your child links'
                        )
                        .addUserOption(
                            userOption(
                                'child',
                                'Child to remove'
                            )
                        )
            )
            .addSubcommand(
                (subcommand) =>
                    subcommand
                        .setName(
                            'leave-parent'
                        )
                        .setDescription(
                            'Remove your mother or father link'
                        )
                        .addStringOption(
                            (option) =>
                                option
                                    .setName(
                                        'parent'
                                    )
                                    .setDescription(
                                        'Parent link to remove'
                                    )
                                    .setRequired(
                                        true
                                    )
                                    .addChoices(
                                        {
                                            name:
                                                'Mother',
                                            value:
                                                'mother'
                                        },
                                        {
                                            name:
                                                'Father',
                                            value:
                                                'father'
                                        }
                                    )
                        )
            )
            .addSubcommand(
                (subcommand) =>
                    subcommand
                        .setName(
                            'sibling'
                        )
                        .setDescription(
                            'Ask someone to become your sibling'
                        )
                        .addUserOption(
                            userOption(
                                'user',
                                'Sibling user'
                            )
                        )
            )
            .addSubcommand(
                (subcommand) =>
                    subcommand
                        .setName(
                            'unsibling'
                        )
                        .setDescription(
                            'Remove a sibling link'
                        )
                        .addUserOption(
                            userOption(
                                'user',
                                'Sibling user'
                            )
                        )
            )
            .addSubcommand(
                (subcommand) =>
                    addDateOptions(
                        subcommand
                            .setName(
                                'marry'
                            )
                            .setDescription(
                                'Ask someone to marry you'
                            )
                            .addUserOption(
                                userOption(
                                    'user',
                                    'User to marry'
                                )
                            )
                    )
            )
            .addSubcommand(
                (subcommand) =>
                    subcommand
                        .setName(
                            'divorce'
                        )
                        .setDescription(
                            'Remove a marriage link'
                        )
                        .addUserOption(
                            userOption(
                                'user',
                                'User to divorce'
                            )
                        )
            )
            .addSubcommand(
                (subcommand) =>
                    addDateOptions(
                        subcommand
                            .setName(
                                'date'
                            )
                            .setDescription(
                                'Ask someone to date you'
                            )
                            .addUserOption(
                                userOption(
                                    'user',
                                    'User to date'
                                )
                            )
                    )
            )
            .addSubcommand(
                (subcommand) =>
                    subcommand
                        .setName(
                            'breakup'
                        )
                        .setDescription(
                            'Remove a dating link'
                        )
                        .addUserOption(
                            userOption(
                                'user',
                                'User to break up with'
                            )
                        )
            )
            .addSubcommand(
                (subcommand) =>
                    subcommand
                        .setName(
                            'bestie'
                        )
                        .setDescription(
                            'Ask someone to become your Bestie'
                        )
                        .addUserOption(
                            userOption(
                                'user',
                                'Bestie user'
                            )
                        )
            )
            .addSubcommand(
                (subcommand) =>
                    subcommand
                        .setName(
                            'unbestie'
                        )
                        .setDescription(
                            'Remove a Bestie link'
                        )
                        .addUserOption(
                            userOption(
                                'user',
                                'Bestie user'
                            )
                        )
            ),

    async execute(
        interaction
    ) {

        try {

            const subcommand =
                interaction.options.getSubcommand();

            if (
                subcommand === 'view'
            ) {

                const target =
                    interaction.options.getUser(
                        'user'
                    );

                const member =
                    await fetchMemberOrNull(
                        interaction.guild,
                        target.id
                    );

                await interaction.reply({
                    embeds: [
                        await buildRelationshipEmbed(
                            interaction,
                            member ?? target
                        )
                    ],
                    flags:
                        64
                });

                return;

            }

            if (
                requestTypeBySubcommand[subcommand]
            ) {

                const requestType =
                    requestTypeBySubcommand[subcommand];

                const target =
                    interaction.options.getUser(
                        subcommand === 'adopt'
                            ? 'child'
                            : 'user'
                    );

                const startedAt =
                    [
                        'marriage',
                        'dating'
                    ].includes(
                        requestType
                    )
                        ? getDateOptions(
                            interaction
                        )
                        : null;

                await sendRelationshipRequest(
                    interaction,
                    requestType,
                    target,
                    startedAt
                );

                return;

            }

            if (
                subcommand === 'abandon'
            ) {

                const child =
                    interaction.options.getUser(
                        'child'
                    );

                const parentType =
                    getParentTypeForMember(
                        interaction.member
                    );

                await removeOrReply(
                    interaction,
                    parentType,
                    interaction.user.id,
                    child.id,
                    `${child} is no longer listed as your child.`,
                    `${child} is not listed as your child.`
                );

                return;

            }

            if (
                subcommand === 'leave-parent'
            ) {

                const parentType =
                    interaction.options.getString(
                        'parent'
                    );

                const rows =
                    await getRelationshipsForUser(
                        interaction.user.id
                    );

                const parent =
                    rows.find(
                        (row) =>
                            row.type === parentType &&
                            row.user_b_id === interaction.user.id
                    );

                if (
                    !parent
                ) {

                    await interaction.reply({
                        content:
                            `You do not have a ${parentType} link.`,
                        flags:
                            64
                    });

                    return;

                }

                await removeOrReply(
                    interaction,
                    parentType,
                    parent.user_a_id,
                    interaction.user.id,
                    `Your ${parentType} relationship was removed.`,
                    `You do not have that ${parentType} link.`
                );

                return;

            }

            const target =
                interaction.options.getUser(
                    'user'
                );

            if (
                subcommand === 'unsibling'
            )
                await removeOrReply(
                    interaction,
                    'sibling',
                    interaction.user.id,
                    target.id,
                    `Your sibling relationship with ${target} was removed.`,
                    `You are not siblings with ${target}.`
                );
            else if (
                subcommand === 'divorce'
            )
                await removeOrReply(
                    interaction,
                    'marriage',
                    interaction.user.id,
                    target.id,
                    `Your marriage with ${target} was removed.`,
                    `You are not married to ${target}.`
                );
            else if (
                subcommand === 'breakup'
            )
                await removeOrReply(
                    interaction,
                    'dating',
                    interaction.user.id,
                    target.id,
                    `Your dating relationship with ${target} was removed.`,
                    `You are not dating ${target}.`
                );
            else if (
                subcommand === 'unbestie'
            )
                await removeOrReply(
                    interaction,
                    'bestie',
                    interaction.user.id,
                    target.id,
                    `${target} is no longer listed as your Bestie.`,
                    `${target} is not listed as your Bestie.`
                );

        }
        catch (error) {

            await interaction.reply({
                content:
                    error.message || 'Relationship command failed.',
                flags:
                    64
            });

        }

    }

};
