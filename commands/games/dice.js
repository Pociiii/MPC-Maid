const { SlashCommandBuilder } = require('discord.js');

const { createEmbed } = require('../../utils/embeds');
const { getRandomColor } = require('../../data/constants');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Roll 2d6 against the bot'),

    async execute(interaction) {

        const playerDie1 =
            Math.floor(Math.random() * 6) + 1;

        const playerDie2 =
            Math.floor(Math.random() * 6) + 1;

        const botDie1 =
            Math.floor(Math.random() * 6) + 1;

        const botDie2 =
            Math.floor(Math.random() * 6) + 1;

        const playerTotal =
            playerDie1 + playerDie2;

        const botTotal =
            botDie1 + botDie2;

        let title;

        if (playerTotal > botTotal) {

            title = 'You win!';

        } else if (playerTotal < botTotal) {

            title = 'You lose!';

        } else {

            title = 'It\'s a tie!';

        }

        const embed = createEmbed({
            color: getRandomColor(),
            authorName:
                interaction.user.displayName,

            authorIcon:
                interaction.user.displayAvatarURL(),

            title,

            description:
`- You: ${playerDie1} + ${playerDie2} = **${playerTotal}**
- Bot: ${botDie1} + ${botDie2} = **${botTotal}**`,


            footerText: 'Text only',

            timestamp: true

        });

        await interaction.reply({
            embeds: [embed]
        });

    }

};