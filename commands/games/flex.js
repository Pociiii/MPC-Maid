const { SlashCommandBuilder } = require('discord.js');

const { createEmbed } = require('../../utils/embeds');
const { getRandomGif } = require('../../utils/gifs');

const {
    COOLDOWNS,
    getRandomColor
} = require('../../data/constants');

const {
    handleCooldown
} = require('../../utils/cooldowns');

const ROLES =
    require('../../data/roles.json');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('flex')
        .setDescription('Show off your muscles'),

    async execute(interaction) {

        if (
            await handleCooldown(
                interaction,
                interaction.commandName,
                COOLDOWNS.FLEX
            )
        )
            return;

        let category = 'flex_w';

        if (
            interaction.member.roles.cache.has(
                ROLES.DARK_SKIN
            )
        ) {

            category = 'flex_b';

        }

        const result =
            getRandomGif(category);

        const embed = createEmbed({

            color: getRandomColor(),

            authorName: interaction.user.displayName,
            authorIcon: interaction.user.displayAvatarURL(),
            title: 'Flex',
            image: result.url,
            footerText: `GIF #${result.index}/${result.total}`,
            timestamp: true

        });

        await interaction.reply({
            embeds: [embed]
        });

    }

};