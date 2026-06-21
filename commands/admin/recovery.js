const {
    PermissionsBitField,
    SlashCommandBuilder
} = require('discord.js');

const {
    getRandomColor
} = require('../../data/constants');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    createDatabaseBackup
} = require('../../utils/databaseBackup');

const {
    clearUserBusy
} = require('../../utils/pornScenes');

const {
    addCoins,
    addXP,
    getOrCreateUser,
    setCoins,
    setXP
} = require('../../utils/users');

const {
    addBooster
} = require('../../utils/boosters');

function getOwnerIds() {

    return (process.env.OWNER_IDS ?? '')
        .split(
            ','
        )
        .map(
            (id) =>
                id.trim()
        )
        .filter(
            Boolean
        );

}

async function isOwner(
    interaction
) {

    const ownerIds =
        getOwnerIds();

    if (
        ownerIds.includes(
            interaction.user.id
        )
    )
        return true;

    return interaction.guild?.ownerId === interaction.user.id;

}

async function guardOwner(
    interaction
) {

    if (
        await isOwner(
            interaction
        )
    )
        return false;

    await interaction.reply({
        content:
            'Only the bot/server owner can use recovery tools.',
        flags:
            64
    });

    return true;

}

function buildResultEmbed(
    interaction,
    title,
    description
) {

    return createEmbed({
        color:
            getRandomColor(),
        authorName:
            interaction.user.displayName,
        authorIcon:
            interaction.user.displayAvatarURL(),
        title,
        description,
        footerText:
            '/recovery',
        timestamp:
            true
    });

}

async function replyResult(
    interaction,
    title,
    description
) {

    const payload = {
        embeds: [
            buildResultEmbed(
                interaction,
                title,
                description
            )
        ]
    };

    if (
        interaction.deferred ||
        interaction.replied
    )
        return interaction.editReply(
            payload
        );

    return interaction.reply({
        ...payload,
        flags:
            64
    });

}

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'recovery'
            )
            .setDescription(
                'Owner recovery tools'
            )
            .setDefaultMemberPermissions(
                PermissionsBitField.Flags.Administrator
            )
            .addSubcommand(
                (subcommand) =>
                    subcommand
                        .setName(
                            'backup'
                        )
                        .setDescription(
                            'Create a database backup now'
                        )
            )
            .addSubcommand(
                (subcommand) =>
                    subcommand
                        .setName(
                            'clearbusy'
                        )
                        .setDescription(
                            'Clear a stuck pornscene busy status'
                        )
                        .addUserOption(
                            (option) =>
                                option
                                    .setName(
                                        'user'
                                    )
                                    .setDescription(
                                        'User to clear'
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
                            'addcoins'
                        )
                        .setDescription(
                            'Add or remove coins'
                        )
                        .addUserOption(
                            (option) =>
                                option
                                    .setName(
                                        'user'
                                    )
                                    .setDescription(
                                        'Target user'
                                    )
                                    .setRequired(
                                        true
                                    )
                        )
                        .addIntegerOption(
                            (option) =>
                                option
                                    .setName(
                                        'amount'
                                    )
                                    .setDescription(
                                        'Positive or negative amount'
                                    )
                                    .setMinValue(
                                        -1000000
                                    )
                                    .setMaxValue(
                                        1000000
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
                            'setcoins'
                        )
                        .setDescription(
                            'Set user coins'
                        )
                        .addUserOption(
                            (option) =>
                                option
                                    .setName(
                                        'user'
                                    )
                                    .setDescription(
                                        'Target user'
                                    )
                                    .setRequired(
                                        true
                                    )
                        )
                        .addIntegerOption(
                            (option) =>
                                option
                                    .setName(
                                        'amount'
                                    )
                                    .setDescription(
                                        'New coin balance'
                                    )
                                    .setMinValue(
                                        0
                                    )
                                    .setMaxValue(
                                        10000000
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
                            'addxp'
                        )
                        .setDescription(
                            'Add or remove XP'
                        )
                        .addUserOption(
                            (option) =>
                                option
                                    .setName(
                                        'user'
                                    )
                                    .setDescription(
                                        'Target user'
                                    )
                                    .setRequired(
                                        true
                                    )
                        )
                        .addIntegerOption(
                            (option) =>
                                option
                                    .setName(
                                        'amount'
                                    )
                                    .setDescription(
                                        'Positive or negative amount'
                                    )
                                    .setMinValue(
                                        -1000000
                                    )
                                    .setMaxValue(
                                        1000000
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
                            'setxp'
                        )
                        .setDescription(
                            'Set user XP'
                        )
                        .addUserOption(
                            (option) =>
                                option
                                    .setName(
                                        'user'
                                    )
                                    .setDescription(
                                        'Target user'
                                    )
                                    .setRequired(
                                        true
                                    )
                        )
                        .addIntegerOption(
                            (option) =>
                                option
                                    .setName(
                                        'amount'
                                    )
                                    .setDescription(
                                        'New XP balance'
                                    )
                                    .setMinValue(
                                        0
                                    )
                                    .setMaxValue(
                                        10000000
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
                            'givebooster'
                        )
                        .setDescription(
                            'Give boosters to a user'
                        )
                        .addUserOption(
                            (option) =>
                                option
                                    .setName(
                                        'user'
                                    )
                                    .setDescription(
                                        'Target user'
                                    )
                                    .setRequired(
                                        true
                                    )
                        )
                        .addStringOption(
                            (option) =>
                                option
                                    .setName(
                                        'stat'
                                    )
                                    .setDescription(
                                        'Booster stat'
                                    )
                                    .setRequired(
                                        true
                                    )
                                    .addChoices(
                                        {
                                            name:
                                                'Performance',
                                            value:
                                                'performance'
                                        },
                                        {
                                            name:
                                                'Stamina',
                                            value:
                                                'stamina'
                                        },
                                        {
                                            name:
                                                'Fame',
                                            value:
                                                'fame'
                                        }
                                    )
                        )
                        .addIntegerOption(
                            (option) =>
                                option
                                    .setName(
                                        'tier'
                                    )
                                    .setDescription(
                                        'Booster tier'
                                    )
                                    .setMinValue(
                                        1
                                    )
                                    .setMaxValue(
                                        4
                                    )
                                    .setRequired(
                                        true
                                    )
                        )
                        .addIntegerOption(
                            (option) =>
                                option
                                    .setName(
                                        'quantity'
                                    )
                                    .setDescription(
                                        'Amount to give'
                                    )
                                    .setMinValue(
                                        1
                                    )
                                    .setMaxValue(
                                        99
                                    )
                                    .setRequired(
                                        true
                                    )
                        )
            ),

    async execute(
        interaction
    ) {

        if (
            await guardOwner(
                interaction
            )
        )
            return;

        const subcommand =
            interaction.options.getSubcommand();

        if (
            subcommand === 'backup'
        ) {

            await interaction.deferReply({
                flags:
                    64
            });

            const filePath =
                await createDatabaseBackup();

            await replyResult(
                interaction,
                'Backup Created',
                `Database backup created:\n\`${filePath}\``
            );

            return;

        }

        const target =
            interaction.options.getUser(
                'user'
            );

        await getOrCreateUser(
            target.id
        );

        if (
            subcommand === 'clearbusy'
        ) {

            const busy =
                clearUserBusy(
                    target.id
                );

            await replyResult(
                interaction,
                'Busy Status Cleared',
                busy
                    ? `<@${target.id}> and their linked partner were cleared.`
                    : `<@${target.id}> was not marked busy.`
            );

            return;

        }

        const amount =
            interaction.options.getInteger(
                'amount'
            );

        if (
            subcommand === 'addcoins'
        ) {

            await addCoins(
                target.id,
                amount
            );

            await replyResult(
                interaction,
                'Coins Updated',
                `<@${target.id}> changed by **${amount} coins**.`
            );

            return;

        }

        if (
            subcommand === 'setcoins'
        ) {

            await setCoins(
                target.id,
                amount
            );

            await replyResult(
                interaction,
                'Coins Set',
                `<@${target.id}> now has **${amount} coins**.`
            );

            return;

        }

        if (
            subcommand === 'addxp'
        ) {

            await addXP(
                target.id,
                amount
            );

            await replyResult(
                interaction,
                'XP Updated',
                `<@${target.id}> changed by **${amount} XP**.`
            );

            return;

        }

        if (
            subcommand === 'setxp'
        ) {

            await setXP(
                target.id,
                amount
            );

            await replyResult(
                interaction,
                'XP Set',
                `<@${target.id}> now has **${amount} XP**.`
            );

            return;

        }

        if (
            subcommand === 'givebooster'
        ) {

            const stat =
                interaction.options.getString(
                    'stat'
                );

            const tier =
                interaction.options.getInteger(
                    'tier'
                );

            const quantity =
                interaction.options.getInteger(
                    'quantity'
                );

            await addBooster(
                target.id,
                stat,
                tier,
                quantity
            );

            await replyResult(
                interaction,
                'Booster Added',
                `<@${target.id}> received **${quantity}x ${stat} tier ${tier} booster**.`
            );

        }

    }

};
