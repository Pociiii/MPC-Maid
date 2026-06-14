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
- ${emojis.scene_completed} Scenes Completed: **${user.scenes_completed}**

- ${emojis.spank_given} Spanks Given: **${user.spanks_given}**
- ${emojis.spank_taken} Spanks Taken: **${user.spanks_taken}**
- ${emojis.kiss_given} Kisses Given: **${user.kisses_given}**
- ${emojis.kiss_taken} Kisses Taken: **${user.kisses_taken}**`,

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