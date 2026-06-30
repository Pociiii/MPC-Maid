require('dotenv').config();

const {
    validateEnv
} = require('./utils/env');

validateEnv();

const fs = require('fs');
const path = require('path');

const {
Client,
Collection,
GatewayIntentBits,
Events,
REST,
Routes,
PermissionFlagsBits
} = require('discord.js');

const ROLES =
    require('./data/roles.json');

const {
    getRandomGif
} = require('./utils/gifs');

const {
    createEmbed
} = require('./utils/embeds');

const {
    CHANNELS,
    getRandomColor
} = require('./data/constants');

const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {

    addSpankGiven,
    addSpankTaken

} = require('./utils/users');

const handleInteractions =
    require('./handlers/interactions');

const {
    startShowcaseAutoDrop
} = require('./features/showcaseAutoDrop');

const {
    logBotEvent,
    logError,
    logWarning
} = require('./utils/inboxLogger');

const {
    startDatabaseBackups
} = require('./utils/databaseBackup');

const {
    startPregnancyScheduler
} = require('./features/pregnancy/scheduler');

const {
    startDailyWyrScheduler
} = require('./features/daily-wyr/dailyWyr');

const {
    clearAllSceneBusy
} = require('./utils/pornScenes');

process.on(
    'unhandledRejection',
    error => {
        console.error(
            'UNHANDLED REJECTION'
        );
        console.error(
            error
        );
    }
);

process.on(
    'uncaughtException',
    error => {
        console.error(
            'UNCAUGHT EXCEPTION'
        );
        console.error(
            error
        );
    }
);

async function sendGameChatMessage(
    client,
    content
) {

    const channel =
        client.channels.cache.get(
            CHANNELS.GAME_CHAT
        ) ??
        await client.channels.fetch(
            CHANNELS.GAME_CHAT
        ).catch(
            () => null
        );

    if (
        !channel?.send
    )
        return false;

    return Boolean(
        await channel.send({
            content
        }).catch(
            () => null
        )
    );

}

async function ensureCustomSceneCommandsUnlocked(
    client
) {

    const channel =
        client.channels.cache.get(
            CHANNELS.CUSTOM_SCENE
        ) ??
        await client.channels.fetch(
            CHANNELS.CUSTOM_SCENE
        ).catch(
            () => null
        );

    if (
        !channel?.permissionOverwrites?.edit ||
        !channel.guild?.roles?.everyone
    ) {

        void logWarning(
            client,
            {
                title:
                    'Custom Scene Commands Still Locked',
                description:
                    `Could not edit permissions for <#${CHANNELS.CUSTOM_SCENE}>.`
            }
        );

        return;

    }

    await channel.permissionOverwrites.edit(
        channel.guild.roles.everyone,
        {
            UseApplicationCommands:
                true
        },
        {
            reason:
                'Allow slash commands in the custom scene channel'
        }
    ).catch(
        error => {

            void logError(
                client,
                {
                    title:
                        'Custom Scene Command Unlock Failed',
                    error,
                    fields: [
                        {
                            name:
                                '\uD83D\uDCCD Channel',
                            value:
                                `<#${CHANNELS.CUSTOM_SCENE}>`,
                            inline:
                                true
                        },
                        {
                            name:
                                '\uD83D\uDD10 Permission',
                            value:
                                PermissionFlagsBits.UseApplicationCommands.toString(),
                            inline:
                                true
                        }
                    ]
                }
            );

        }
    );

}

// Initialize database
require('./database/database');

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildPresences
]
});

client.sendGameChatMessage =
    (content) =>
        sendGameChatMessage(
            client,
            content
        );

client.commands = new Collection();

const commands = [];

// Load commands automatically
const foldersPath = path.join(__dirname, 'commands');

const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {

    const commandsPath = path.join(foldersPath, folder);

    const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {

        const filePath = path.join(commandsPath, file);

        const command = require(filePath);

        if ('data' in command && 'execute' in command) {

            client.commands.set(
                command.data.name,
                command
            );

            commands.push(
                command.data.toJSON()
            );

            console.log(
                `Loaded command: ${command.data.name}`
            );
        }
        else {

            console.log(
                `Missing data or execute in ${file}`
            );
        }
    }
}

// Register slash commands
const rest = new REST({
version: '10'
}).setToken(process.env.TOKEN);

(async () => {

    try {

        console.log(
            `Registering ${commands.length} slash commands...`
        );

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            {
                body: commands
            }
        );

        console.log(
            'Slash commands registered.'
        );

    }

    catch (error) {

        console.error(error);

    }

})();

// Bot ready
client.once(
Events.ClientReady,
async readyClient => {

    try {

        console.log(
            `Logged in as ${readyClient.user.tag}`
        );

        void sendGameChatMessage(
            readyClient,
            'MPC Maid is online and ready.'
        );

        const clearedBusy =
            clearAllSceneBusy();

        void logBotEvent(
            readyClient,
            {
                title:
                    'Bot Started',
                description:
                    `${readyClient.user.tag} is online.`,
                fields: [
                    {
                        name:
                            '\uD83C\uDFAC Scene Busy Reset',
                        value:
                            `${clearedBusy} in-memory busy entries cleared.`,
                        inline:
                            true
                    },
                    {
                        name:
                            '\uD83D\uDCCB Commands',
                        value:
                            String(
                                commands.length
                            ),
                        inline:
                            true
                    }
                ]
            }
        );

        startShowcaseAutoDrop(
            readyClient
        );

        startDatabaseBackups(
            readyClient
        );

        await ensureCustomSceneCommandsUnlocked(
            readyClient
        );

        startPregnancyScheduler(
            readyClient
        );

        startDailyWyrScheduler(
            readyClient
        );

    }
    catch (error) {

        console.error(
            'READY ERROR'
        );
        console.error(
            error
        );

    }

}


);

async function replyCommandError(
    interaction
) {

    const payload = {
        content:
            'There was an error executing this command.',
        flags:
            64
    };

    if (
        interaction.replied ||
        interaction.deferred
    ) {

        await interaction.followUp(
            payload
        );

        return;

    }

    await interaction.reply(
        payload
    );

}

async function safeReplyInteractionError(
    interaction,
    label
) {

    try {

        await replyCommandError(
            interaction
        );

    }
    catch (error) {

        console.error(
            `${label} REPLY FAILED`
        );
        console.error(
            error
        );

    }

}

// Command handler
client.on(
Events.InteractionCreate,
async interaction => {
    

    try {

        if (
            await handleInteractions(
                interaction
            )
        )
            return;

    }
    catch (error) {

        console.error(
            'INTERACTION HANDLER ERROR'
        );
        console.error(
            error
        );

        await safeReplyInteractionError(
            interaction,
            'INTERACTION HANDLER ERROR'
        );

        void logError(
            interaction.client,
            {
                title:
                    'Interaction Handler Error',
                error,
                fields: [
                    {
                        name:
                            '\uD83D\uDD18 Interaction',
                        value:
                            interaction.customId ??
                            interaction.commandName ??
                            interaction.type,
                        inline:
                            true
                    },
                    {
                        name:
                            '\uD83D\uDC64 User',
                        value:
                            `${interaction.user.tag} (${interaction.user.id})`,
                        inline:
                            true
                    },
                    {
                        name:
                            '\uD83D\uDCCD Channel',
                        value:
                            interaction.channelId
                                ? `<#${interaction.channelId}>`
                                : 'Unknown',
                        inline:
                            true
                    }
                ]
            }
        );

        return;

    }

    if (!interaction.isChatInputCommand())
        return;

    const command =
        client.commands.get(
            interaction.commandName
        );

    if (!command)
        return;

    try {

        await command.execute(
            interaction
        );

    }
    catch (error) {

        console.error(
            `COMMAND ERROR /${interaction.commandName}`
        );
        console.error(error);

        await safeReplyInteractionError(
            interaction,
            'COMMAND ERROR'
        );

        void logError(
            interaction.client,
            {
                title:
                    'Command Error',
                error,
                fields: [
                    {
                        name:
                            '\uD83D\uDCCB Command',
                        value:
                            `/${interaction.commandName}`,
                        inline:
                            true
                    },
                    {
                        name:
                            '\uD83D\uDC64 User',
                        value:
                            `${interaction.user.tag} (${interaction.user.id})`,
                        inline:
                            true
                    },
                    {
                        name:
                            '\uD83D\uDCCD Channel',
                        value:
                            interaction.channelId
                                ? `<#${interaction.channelId}>`
                                : 'Unknown',
                        inline:
                            true
                    }
                ]
            }
        );
    }
}


);

client.login(
process.env.TOKEN
);
