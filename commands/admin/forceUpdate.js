const {
    exec
} = require('child_process');

const {
    PermissionsBitField,
    SlashCommandBuilder
} = require('discord.js');

const updateScript =
    '/usr/local/bin/update-mpc-maid.sh';

const outputLimit =
    1800;

function getOwnerIds() {

    return (process.env.OWNER_IDS ?? '')
        .split(
            /[\s,;]+/
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

function trimOutput(
    output
) {

    const normalized =
        output.trim() ||
        'No output from update script.';

    return normalized.length > outputLimit
        ? normalized.slice(
            -outputLimit
        )
        : normalized;

}

function codeBlock(
    output
) {

    return `\`\`\`\n${output.replace(
        /```/g,
        "'''"
    )}\n\`\`\``;

}

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'force-update'
            )
            .setDescription(
                'Manually run the MPC Maid update script'
            )
            .setDefaultMemberPermissions(
                PermissionsBitField.Flags.Administrator
            ),

    async execute(
        interaction
    ) {

        if (
            !await isOwner(
                interaction
            )
        ) {

            await interaction.reply({
                content:
                    'Only the bot owner can force an update.',
                flags:
                    64
            });

            return;

        }

        await interaction.reply({
            content:
                '🔄 Starting MPC Maid update...',
            flags:
                64
        });

        exec(
            updateScript,
            {
                timeout:
                    120 * 1000,
                windowsHide:
                    true
            },
            async (
                error,
                stdout,
                stderr
            ) => {

                const output =
                    trimOutput(
                        [
                            stdout,
                            stderr
                        ]
                            .filter(
                                Boolean
                            )
                            .join(
                                '\n'
                            )
                    );

                const status =
                    error
                        ? '❌ Update failed'
                        : '✅ Update completed successfully';

                await interaction.editReply({
                    content:
                        `${status}\n\n${codeBlock(
                            output
                        )}`
                }).catch(
                    () => null
                );

            }
        );

    }

};
