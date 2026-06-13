const {
    SlashCommandBuilder
} = require('discord.js');

const fs = require('fs');
const path = require('path');

const {
    createEmbed
} = require('../../utils/embeds');

module.exports = {

    data: new SlashCommandBuilder()

        .setName('gifcount')

        .setDescription(
            'Count GIFs in data files'
        )

        .addStringOption(option =>

            option

                .setName('type')

                .setDescription(
                    'What to count'
                )

                .setRequired(true)

                .addChoices(

                    {
                        name: 'GIF Commands',
                        value: 'gifs'
                    },

                    {
                        name: 'Scenes',
                        value: 'scenes'
                    }

                )

        ),

    async execute(interaction) {

        const type =
            interaction.options.getString(
                'type'
            );

        const basePath =
            path.join(
                __dirname,
                '../../data',
                type
            );

        const stats = [];

        let total = 0;

        function scan(
            dir,
            prefix = ''
        ) {

            const items =
                fs.readdirSync(dir);

            for (
                const item
                of items
            ) {

                const fullPath =
                    path.join(
                        dir,
                        item
                    );

                const stat =
                    fs.statSync(
                        fullPath
                    );

                if (
                    stat.isDirectory()
                ) {

                    scan( fullPath, `${prefix}${item}/` );

                }

                else if (
                    item.endsWith( '.json' )
                ) {

                    const gifs =
                        JSON.parse(

                            fs.readFileSync(
                                fullPath,
                                'utf8'
                            )

                        );

                    const count = gifs.length;

                    total += count;

                    stats.push( `- ${prefix}${item.replace('.json', '')}: ${count}`);

                }

            }

        }

        scan(basePath);

        const embed =
            createEmbed({

                title:
                    type === 'gifs'
                        ? '📊 GIF Statistics'
                        : '🎬 Scene Statistics',

                description: stats.join('\n'),

                footerText: `Total: ${total}`,

                timestamp: true

            });

        await interaction.reply({

            embeds: [embed]

        });

    }

};