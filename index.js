require('dotenv').config();

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

// Initialize database
require('./database/database');

const client = new Client({
intents: [
GatewayIntentBits.Guilds
]
});

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
readyClient => {

    console.log(
        `Logged in as ${readyClient.user.tag}`
    );

}


);

// Command handler
client.on(
Events.InteractionCreate,
async interaction => {


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

        try {

            if (interaction.replied ||
                interaction.deferred) {

                await interaction.followUp({
                    content: 'There was an error executing this command.'
                });

            } else {

                await interaction.reply({
                    content: 'There was an error executing this command.'
                });

            }

        } catch (err) {

            console.error('COMMAND ERROR');
            console.error(error);

            try {

                if (interaction.replied ||
                    interaction.deferred) {

                    await interaction.followUp({
                        content: 'There was an error executing this command.'
                    });

                } else {

                    await interaction.reply({
                        content: 'There was an error executing this command.'
                    });

                }

            } catch (error) {

                console.error('COMMAND ERROR');
                console.error(error);

            }


        }
    }
}


);

client.login(
process.env.TOKEN
);
