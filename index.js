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
Routes
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
    logError
} = require('./utils/inboxLogger');

const {
    startDatabaseBackups
} = require('./utils/databaseBackup');

const {
    startPregnancyScheduler
} = require('./features/pregnancy/scheduler');

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

// Initialize database
require('./database/database');

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers
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
                            'Scene Busy Reset',
                        value:
                            `${clearedBusy} in-memory busy entries cleared.`,
                        inline:
                            true
                    },
                    {
                        name:
                            'Commands',
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

        startPregnancyScheduler(
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
                            'Interaction',
                        value:
                            interaction.customId ??
                            interaction.commandName ??
                            interaction.type,
                        inline:
                            true
                    },
                    {
                        name:
                            'User',
                        value:
                            `${interaction.user.tag} (${interaction.user.id})`,
                        inline:
                            true
                    },
                    {
                        name:
                            'Channel',
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

        console.error('COMMAND ERROR');
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
                            'Command',
                        value:
                            `/${interaction.commandName}`,
                        inline:
                            true
                    },
                    {
                        name:
                            'User',
                        value:
                            `${interaction.user.tag} (${interaction.user.id})`,
                        inline:
                            true
                    },
                    {
                        name:
                            'Channel',
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
