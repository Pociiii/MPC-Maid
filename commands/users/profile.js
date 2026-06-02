const { SlashCommandBuilder } = require('discord.js');

const { getOrCreateUser } = require('../../utils/users');
const { createEmbed } = require('../../utils/embeds');

const emojis = require('../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your profile'),

    async execute(interaction) {

        const user = await getOrCreateUser(
            interaction.user.id
        );

        const embed = createEmbed({

            color: '#ff69b4',

            authorName: interaction.user.displayName,
            authorIcon: interaction.user.displayAvatarURL(),

            title: 'Profile',

            description:
`- ${emojis.coin} Coins: **${user.coins}**
- ${emojis.xp} XP: **${user.xp}**

- ${emojis.performance} Performance: **${user.performance}**
- ${emojis.stamina} Stamina: **${user.stamina}**
- ${emojis.fame} Fame: **${user.fame}**

- ${emojis.ranking} Ranking: **${user.ranking}**
- ${emojis.scene_completed} Scenes Completed: **${user.scenes_completed}**`,

            footerText: 'MPC Maid',
            timestamp: true

        });

        await interaction.reply({
            embeds: [embed]
        });
    }
};