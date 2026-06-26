const path =
    require('path');

const {
    spawn
} = require('child_process');

const {
    PermissionsBitField,
    SlashCommandBuilder
} = require('discord.js');

const {
    createUserEmbed
} = require('../../utils/embeds');

const actions = {
    shutdown: {
        label:
            'Shutdown',
        gameChatMessage:
            'MPC Maid is going offline for a bit. Be good, or at least be funny.',
        title:
            'Bot Shutdown',
        success:
            'Shutdown message sent. MPC Maid is going offline now.',
        partial:
            'I could not post in game chat, but MPC Maid is going offline now.'
    },
    restart: {
        label:
            'Restart',
        gameChatMessage:
            'MPC Maid is restarting. Tiny wardrobe change, back in a moment.',
        title:
            'Bot Restart',
        success:
            'Restart message sent. MPC Maid is restarting now.',
        partial:
            'I could not post in game chat, but MPC Maid is restarting now.'
    }
};

async function canControlBot(
    interaction
) {

    const ownerIds =
        (process.env.OWNER_IDS ?? '')
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

    if (
        ownerIds.includes(
            interaction.user.id
        )
    )
        return true;

    if (
        interaction.guild?.ownerId === interaction.user.id
    )
        return true;

    return interaction.memberPermissions?.has(
        PermissionsBitField.Flags.Administrator
    );

}

function startReplacementProcess() {

    const indexPath =
        path.join(
            __dirname,
            '..',
            '..',
            'index.js'
        );

    const child =
        spawn(
            process.execPath,
            [
                indexPath
            ],
            {
                cwd:
                    path.join(
                        __dirname,
                        '..',
                        '..'
                    ),
                detached:
                    true,
                stdio:
                    'ignore',
                windowsHide:
                    true
            }
        );

    child.unref();

}

function usesExternalProcessManager() {

    return Boolean(
        process.env.MPC_PROCESS_MANAGER ||
        process.env.INVOCATION_ID ||
        process.env.pm_id
    );

}

function scheduleExit(
    client,
    shouldRestart
) {

    setTimeout(
        () => {

            if (
                shouldRestart &&
                !usesExternalProcessManager()
            )
                startReplacementProcess();

            client.destroy();
            process.exit(
                shouldRestart
                    ? 1
                    : 0
            );

        },
        1000
    );

}

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'botcontrol'
            )
            .setDescription(
                'Admin controls for shutting down or restarting MPC Maid'
            )
            .setDefaultMemberPermissions(
                PermissionsBitField.Flags.Administrator
            )
            .addStringOption(
                (option) =>
                    option
                        .setName(
                            'action'
                        )
                        .setDescription(
                            'What should MPC Maid do?'
                        )
                        .setRequired(
                            true
                        )
                        .addChoices(
                            {
                                name:
                                    'Restart',
                                value:
                                    'restart'
                            },
                            {
                                name:
                                    'Shutdown',
                                value:
                                    'shutdown'
                            }
                        )
            ),

    async execute(
        interaction
    ) {

        if (
            !await canControlBot(
                interaction
            )
        ) {

            await interaction.reply({
                content:
                    'Only an admin or bot owner can control me.',
                flags:
                    64
            });

            return;

        }

        await interaction.deferReply({
            flags:
                64
        });

        const action =
            interaction.options.getString(
                'action',
                true
            );

        const config =
            actions[action];

        if (
            !config
        ) {

            await interaction.editReply({
                content:
                    'That bot control action is not available.'
            });

            return;

        }

        const sent =
            interaction.client.sendGameChatMessage
                ? await interaction.client.sendGameChatMessage(
                    config.gameChatMessage
                )
                : false;

        const embed =
            createUserEmbed(
                interaction,
                {
                    command:
                        '/botcontrol',
                    title:
                        config.title,
                    description:
                        sent
                            ? config.success
                            : config.partial
                }
            );

        await interaction.editReply({
            embeds: [
                embed
            ]
        });

        scheduleExit(
            interaction.client,
            action === 'restart'
        );

    }

};
