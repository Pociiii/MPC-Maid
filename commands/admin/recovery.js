const {
    PermissionsBitField,
    SlashCommandBuilder
} = require('discord.js');

const {
    createUserEmbed
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

const {
    clearActivePregnancy,
    forceBirth,
    forceGenderReveal,
    forcePregnancy,
    getPregnancyDate,
    getPreviousPregnancyDate,
    processPregnancyChecks,
    resetDailyCheck,
    resetDailyPartners
} = require('../../database/pregnancy');

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

    return createUserEmbed(
        interaction,
        {
            command:
                '/recovery',
            title,
            description
        }
    );

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
                            'pregclear'
                        )
                        .setDescription(
                            'Clear active pregnancy for a user'
                        )
                        .addUserOption(
                            (option) =>
                                option
                                    .setName(
                                        'user'
                                    )
                                    .setDescription(
                                        'Carrier to clear'
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
                            'pregforce'
                        )
                        .setDescription(
                            'Force a pregnancy for testing'
                        )
                        .addUserOption(
                            (option) =>
                                option
                                    .setName(
                                        'carrier'
                                    )
                                    .setDescription(
                                        'Carrier'
                                    )
                                    .setRequired(
                                        true
                                    )
                        )
                        .addUserOption(
                            (option) =>
                                option
                                    .setName(
                                        'father'
                                    )
                                    .setDescription(
                                        'Father'
                                    )
                                    .setRequired(
                                        true
                                    )
                        )
                        .addIntegerOption(
                            (option) =>
                                option
                                    .setName(
                                        'day'
                                    )
                                    .setDescription(
                                        'Pregnancy day'
                                    )
                                    .setMinValue(
                                        1
                                    )
                                    .setMaxValue(
                                        30
                                    )
                                    .setRequired(
                                        false
                                    )
                        )
            )
            .addSubcommand(
                (subcommand) =>
                    subcommand
                        .setName(
                            'pregreveal'
                        )
                        .setDescription(
                            'Force gender reveal for active pregnancy'
                        )
                        .addUserOption(
                            (option) =>
                                option
                                    .setName(
                                        'user'
                                    )
                                    .setDescription(
                                        'Carrier'
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
                            'pregbirth'
                        )
                        .setDescription(
                            'Force birth for active pregnancy'
                        )
                        .addUserOption(
                            (option) =>
                                option
                                    .setName(
                                        'user'
                                    )
                                    .setDescription(
                                        'Carrier'
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
                            'pregresetpartners'
                        )
                        .setDescription(
                            'Reset today pregnancy partners for a carrier'
                        )
                        .addUserOption(
                            (option) =>
                                option
                                    .setName(
                                        'user'
                                    )
                                    .setDescription(
                                        'Carrier'
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
                            'pregcheck'
                        )
                        .setDescription(
                            'Force pregnancy check processing'
                        )
                        .addUserOption(
                            (option) =>
                                option
                                    .setName(
                                        'user'
                                    )
                                    .setDescription(
                                        'Optional carrier to reroll previous check'
                                    )
                                    .setRequired(
                                        false
                                    )
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

        if (
            subcommand === 'pregforce'
        ) {

            const carrier =
                interaction.options.getUser(
                    'carrier'
                );

            const father =
                interaction.options.getUser(
                    'father'
                );

            const day =
                interaction.options.getInteger(
                    'day'
                ) ?? 1;

            const pregnancy =
                await forcePregnancy(
                    carrier.id,
                    father.id,
                    day
                );

            await replyResult(
                interaction,
                'Pregnancy Forced',
                `<@${carrier.id}> is pregnant with <@${father.id}> as father.\nDay: **${day}/30**\nBaby: **${pregnancy.baby_gender}**`
            );

            return;

        }

        if (
            subcommand === 'pregcheck'
        ) {

            await interaction.deferReply({
                flags:
                    64
            });

            const carrier =
                interaction.options.getUser(
                    'user'
                );

            const date =
                getPreviousPregnancyDate();

            let resetCount = 0;

            if (
                carrier
            )
                resetCount =
                    await resetDailyCheck(
                        carrier.id,
                        date
                    );

            const results =
                await processPregnancyChecks(
                    date
                );

            const successful =
                results.filter(
                    (result) =>
                        result.success
                );

            await replyResult(
                interaction,
                'Pregnancy Check Processed',
                [
                    `Date checked: **${date}**`,
                    carrier
                        ? `Reset checks for <@${carrier.id}>: **${resetCount}**`
                        : null,
                    `Carriers processed: **${results.length}**`,
                    `Pregnancies created: **${successful.length}**`
                ]
                    .filter(
                        Boolean
                    )
                    .join(
                        '\n'
                    )
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

        if (
            subcommand === 'pregclear'
        ) {

            const changes =
                await clearActivePregnancy(
                    target.id
                );

            await replyResult(
                interaction,
                'Pregnancy Cleared',
                changes
                    ? `<@${target.id}> active pregnancy was cleared.`
                    : `<@${target.id}> had no active pregnancy.`
            );

            return;

        }

        if (
            subcommand === 'pregreveal'
        ) {

            const changes =
                await forceGenderReveal(
                    target.id
                );

            await replyResult(
                interaction,
                'Gender Reveal Forced',
                changes
                    ? `<@${target.id}> pregnancy gender is now revealed.`
                    : `<@${target.id}> had no active pregnancy.`
            );

            return;

        }

        if (
            subcommand === 'pregbirth'
        ) {

            const changes =
                await forceBirth(
                    target.id
                );

            await replyResult(
                interaction,
                'Birth Forced',
                changes
                    ? `<@${target.id}> active pregnancy was marked as born.`
                    : `<@${target.id}> had no active pregnancy.`
            );

            return;

        }

        if (
            subcommand === 'pregresetpartners'
        ) {

            const date =
                getPregnancyDate();

            const changes =
                await resetDailyPartners(
                    target.id,
                    date
                );

            await replyResult(
                interaction,
                'Pregnancy Partners Reset',
                `Removed **${changes}** partner entry${changes === 1 ? '' : 'ies'} for <@${target.id}> today.\nDate: **${date}**`
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
