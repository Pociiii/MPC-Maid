const {
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    ActionRowBuilder
} = require('discord.js');

const fs = require('fs');
const path = require('path');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('addgif')
        .setDescription('Add a GIF'),

    async execute(interaction) {

        const scenesPath = path.join(
            __dirname,
            '../../data/scenes'
        );

        const categories = fs
            .readdirSync(scenesPath)
            .map(folder => ({
                label: folder.toUpperCase(),
                value: folder
            }));

        const menu =
            new StringSelectMenuBuilder()
                .setCustomId('addgif_category')
                .setPlaceholder(
                    'Select category'
                )
                .addOptions(categories);

        const row =
            new ActionRowBuilder()
                .addComponents(menu);

        await interaction.reply({
            content:
                'Select a category',
            components: [row],
            flags: 64
        });

    }

};