const {
    SlashCommandBuilder
} = require('discord.js');

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

function buildCooldownNotice(
    remaining
) {

    return `\u23F3 /drop is still on cooldown. Try again ${formatCooldownTimestamp(
        remaining
    )}.`;

}

function buildDropOptions(
    details
) {

    const dropOptions = {
        authorName:
            details.displayName,
        thumbnail:
            details.avatarUrl,
        userIds: [
            details.userId
        ]
    };

    if (
        details.mediaUrl
    ) {

        dropOptions.imageUrl =
            details.mediaUrl;

        dropOptions.footerText =
            `Custom media by ${details.displayName}`;

    }

    return dropOptions;

}

async function postDrop(
    interaction,
    details
) {

    const reply =
        buildDropPost(
            buildDropOptions(
                details
            )
        );

    return interaction.channel.send({
        embeds:
            reply.embeds,
        files:
            reply.files
    });

}

async function completeDrop(
    interaction,
    details
) {

    await interaction.deferReply({
        flags:
            64
    });

    try {

        const message =
            await postDrop(
                interaction,
                details
            );

        startCooldown(
            interaction.user.id,
            'drop',
            COOLDOWNS.DROP
        );

        await interaction.editReply({
            content:
                `Titty drop posted: ${message.url}`
        });

    }
    catch (error) {

        await interaction.editReply({
            content:
                'I could not post the titty drop.'
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

        await completeDrop(
            interaction,
            {
                avatarUrl:
                    interaction.user.displayAvatarURL(),
                displayName:
                    interaction.member.displayName,
                mediaUrl:
                    attachment?.url ?? null,
                userId:
                    interaction.user.id
            }
        );

    }

};
