const {
    PermissionFlagsBits,
    SlashCommandBuilder
} = require('discord.js');

const {
    drawCurrentLottery,
    ensurePersistentLotteryMessage,
    getAdminStatus,
    updatePersistentLotteryMessage
} = require('../../features/lottery/lottery');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    getRandomColor
} = require('../../data/constants');

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName(
                'lottery-admin'
            )
            .setDescription(
                'Repair and manage the weekly lottery'
            )
            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            )
            .addSubcommand(
                (command) =>
                    command
                        .setName('setup')
                        .setDescription('Create or repair the persistent lottery panel')
            )
            .addSubcommand(
                (command) =>
                    command
                        .setName('refresh')
                        .setDescription('Refresh the persistent lottery panel')
            )
            .addSubcommand(
                (command) =>
                    command
                        .setName('draw')
                        .setDescription('Draw the current lottery immediately')
            )
            .addSubcommand(
                (command) =>
                    command
                        .setName('status')
                        .setDescription('Show lottery and scheduler status')
            ),

    async execute(
        interaction
    ) {

        if (
            !interaction.memberPermissions?.has(
                PermissionFlagsBits.Administrator
            )
        ) {

            await interaction.reply({
                content: 'You need Administrator permission to manage the lottery.',
                flags: 64
            });

            return;

        }

        await interaction.deferReply({
            flags: 64
        });

        const subcommand =
            interaction.options.getSubcommand();

        if (
            subcommand === 'setup'
        ) {

            const message =
                await ensurePersistentLotteryMessage(
                    interaction.client
                );

            if (
                message
            )
                await updatePersistentLotteryMessage(
                    interaction.client
                );

            await interaction.editReply(
                message
                    ? `Lottery panel ready: ${message.url}`
                    : 'The lottery channel is unavailable. Check the configured channel ID and permissions.'
            );

            return;

        }

        if (
            subcommand === 'refresh'
        ) {

            const updated =
                await updatePersistentLotteryMessage(
                    interaction.client
                );

            await interaction.editReply(
                updated
                    ? 'The persistent lottery panel was refreshed.'
                    : 'The lottery panel could not be refreshed.'
            );

            return;

        }

        if (
            subcommand === 'draw'
        ) {

            const result =
                await drawCurrentLottery(
                    interaction.client,
                    {
                        force: true
                    }
                );

            await interaction.editReply(
                result.ok
                    ? result.winnerId
                        ? `Lottery ${result.lotteryId} drawn. <@${result.winnerId}> won ${result.prize.toLocaleString()} coins.`
                        : `Lottery ${result.lotteryId} completed with no tickets sold.`
                    : result.reason
            );

            return;

        }

        const {
            summary,
            messageId,
            schedulerActive
        } = await getAdminStatus();

        const drawUnix =
            Math.floor(
                summary.draws_at / 1000
            );

        const embed =
            createEmbed({
                color: getRandomColor(),
                title: '🎟️ Lottery Status',
                description: `Active lottery **#${summary.id}**`,
                timestamp: true
            });

        embed.addFields(
            {
                name: 'Status',
                value: summary.status,
                inline: true
            },
            {
                name: 'Current Jackpot',
                value: `${summary.jackpot.toLocaleString()} coins`,
                inline: true
            },
            {
                name: 'Tickets / Participants',
                value: `${summary.totalTickets} / ${summary.participantCount}`,
                inline: true
            },
            {
                name: 'Next Draw',
                value: `<t:${drawUnix}:F> (<t:${drawUnix}:R>)`,
                inline: false
            },
            {
                name: 'Persistent Message',
                value: messageId,
                inline: true
            },
            {
                name: 'Scheduler',
                value: schedulerActive
                    ? 'Running'
                    : 'Not running',
                inline: true
            }
        );

        await interaction.editReply({
            embeds: [
                embed
            ]
        });

    }
};
