const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder
} = require('discord.js');

const {
    randomUUID
} = require('crypto');

const {
    buildDropPost
} = require('../../utils/dropPost');

const {
    COOLDOWNS
} = require('../../data/constants');

const {
    formatCooldownTimestamp,
    getCooldownRemaining,
    startCooldown
} = require('../../utils/cooldowns');

const {
    trackDailyQuest
} = require('../../features/daily-quests/dailyQuests');

const {
    incrementAchievementProgress
} = require('../../features/achievements/achievements');

const pendingDrops =
    new Map();

const pendingDropTtlMs =
    2 * 60 * 1000;

function buildConfirmationRow(
    pendingId,
    disabled = false
) {

    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(
                    `drop_confirm:${pendingId}`
                )
                .setLabel(
                    'Confirm post'
                )
                .setStyle(
                    ButtonStyle.Success
                )
                .setDisabled(
                    disabled
                ),
            new ButtonBuilder()
                .setCustomId(
                    `drop_cancel:${pendingId}`
                )
                .setLabel(
                    'Cancel'
                )
                .setStyle(
                    ButtonStyle.Secondary
                )
                .setDisabled(
                    disabled
                )
        );

}

function buildCooldownNotice(
    remaining
) {

    return `\u23F3 /drop is still on cooldown. Try again ${formatCooldownTimestamp(
        remaining
    )}.`;

}

function rememberPendingDrop(
    details
) {

    const pendingId =
        randomUUID();

    pendingDrops.set(
        pendingId,
        {
            ...details,
            expiresAt:
                Date.now() + pendingDropTtlMs
        }
    );

    setTimeout(
        () =>
            pendingDrops.delete(
                pendingId
            ),
        pendingDropTtlMs
    ).unref?.();

    return pendingId;

}

function buildDropOptions(
    pending
) {

    const dropOptions = {
        authorName:
            pending.displayName,
        thumbnail:
            pending.avatarUrl,
        userIds: [
            pending.userId
        ]
    };

    if (
        pending.mediaUrl
    ) {

        dropOptions.imageUrl =
            pending.mediaUrl;

        dropOptions.footerText =
            `Custom media by ${pending.displayName}`;

    }

    return dropOptions;

}

async function postConfirmedDrop(
    interaction,
    pending
) {

    const reply =
        buildDropPost(
            buildDropOptions(
                pending
            )
        );

    return interaction.channel.send({
        embeds:
            reply.embeds,
        files:
            reply.files
    });

}

async function completeConfirmedDrop(
    interaction,
    pending
) {

    await interaction.update({
        content:
            'Posting titty drop...',
        components: []
    });

    try {

        const message =
            await postConfirmedDrop(
                interaction,
                pending
            );

        startCooldown(
            interaction.user.id,
            'drop',
            COOLDOWNS.DROP
        );

        await interaction.editReply({
            content:
                `Titty drop posted: ${message.url}`,
            components: []
        });

    }
    catch (error) {

        await interaction.editReply({
            content:
                'I could not post the titty drop.',
            components: []
        });

        throw error;

    }

    await trackDailyQuest(
        interaction.client,
        interaction.user.id,
        'titty_drop'
    );

    await incrementAchievementProgress(
        interaction.client,
        interaction.user.id,
        'titty_drops'
    );

}

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'drop'
            )
            .setDescription(
                'Random titty drop'
            )
            .addAttachmentOption(
                (option) =>
                    option
                        .setName(
                            'media'
                        )
                        .setDescription(
                            'Custom media'
                        )
                        .setRequired(
                            false
                        )
            ),

    async execute(
        interaction
    ) {

        const attachment =
            interaction.options.getAttachment(
                'media'
            );

        if (
            attachment &&
            !attachment.contentType?.startsWith(
                'image/'
            ) &&
            !attachment.contentType?.startsWith(
                'video/'
            )
        ) {

            await interaction.reply({
                content:
                    'Please upload an image, GIF, or video.',
                flags:
                    64
            });

            return;

        }

        const remaining =
            getCooldownRemaining(
                interaction.user.id,
                interaction.commandName
            );

        if (
            remaining > 0
        ) {

            await interaction.reply({
                content:
                    buildCooldownNotice(
                        remaining
                    ),
                flags:
                    64
            });

            return;

        }

        const pendingId =
            rememberPendingDrop({
                avatarUrl:
                    interaction.user.displayAvatarURL(),
                displayName:
                    interaction.member.displayName,
                mediaUrl:
                    attachment?.url ?? null,
                userId:
                    interaction.user.id
            });

        await interaction.reply({
            content:
                'Confirm to post a titty drop in this channel.',
            components: [
                buildConfirmationRow(
                    pendingId
                )
            ],
            flags:
                64
        });

    },

    async handleDropDecision(
        interaction
    ) {

        const [
            action,
            pendingId
        ] =
            interaction.customId.split(
                ':'
            );

        const pending =
            pendingDrops.get(
                pendingId
            );

        if (
            !pending ||
            pending.expiresAt < Date.now()
        ) {

            pendingDrops.delete(
                pendingId
            );

            await interaction.update({
                content:
                    'This drop confirmation expired. Use `/drop` again.',
                components: []
            });

            return;

        }

        if (
            interaction.user.id !== pending.userId
        ) {

            await interaction.reply({
                content:
                    'Only the user who started this drop can use these buttons.',
                flags:
                    64
            });

            return;

        }

        pendingDrops.delete(
            pendingId
        );

        if (
            action === 'drop_cancel'
        ) {

            await interaction.update({
                content:
                    'Titty drop cancelled. No coins were spent.',
                components: []
            });

            return;

        }

        const remaining =
            getCooldownRemaining(
                interaction.user.id,
                'drop'
            );

        if (
            remaining > 0
        ) {

            await interaction.update({
                content:
                    buildCooldownNotice(
                        remaining
                    ),
                components: []
            });

            return;

        }

        await completeConfirmedDrop(
            interaction,
            pending
        );

    }

};
