const { SlashCommandBuilder } = require('discord.js');
const { COLORS } = require('../../data/constants');
const { getOrCreateUser } = require('../../utils/users');
const {
    createEmbed,
    createReply
} = require('../../utils/embeds');

const emojis = require('../../utils/emojis');

const { getRankTitle } =
    require('../../utils/ranks');

const COMMAND_CONFIG = {
    ephemeral: true
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your profile'),

    async execute(interaction) {

        const user = await getOrCreateUser(interaction.user.id);

        const rankTitle = getRankTitle(user.ranking);

        const embed = createEmbed({

            color: COLORS.DEFAULT,

            authorName: interaction.user.displayName,
            thumbnail: interaction.user.displayAvatarURL(),
            title: 'Profile',

            description:
`- ${emojis.coin} Coins: **${user.coins}**
- ${emojis.xp} XP: **${user.xp}**

- ${emojis.performance} Performance: **${user.performance}**
- ${emojis.stamina} Stamina: **${user.stamina}**
- ${emojis.fame} Fame: **${user.fame}**

- ${emojis.ranking} Ranking: **${rankTitle} (${user.ranking})**
- ${emojis.scene_completed} Scenes Completed: **${user.scenes_completed}**`,

            footerText: 'MPC Maid',
            timestamp: true

        });

        await interaction.reply(
            createReply(
                embed,
                COMMAND_CONFIG.ephemeral
            )
        );
    }
};