const { SlashCommandBuilder } = require('discord.js');
const { startGiftSend } = require('../../features/gifts/giftSystem');

module.exports = {
    data: new SlashCommandBuilder().setName('gift').setDescription('Send permanent collectible gifts')
        .addSubcommand((subcommand) => subcommand.setName('send').setDescription('Send an owned gift to a member')
            .addUserOption((option) => option.setName('user').setDescription('Server member receiving the gift').setRequired(true))),
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });
        const target = interaction.options.getUser('user');
        if (target.id === interaction.user.id) return interaction.editReply('You cannot send a gift to yourself.');
        if (target.bot) return interaction.editReply('You cannot send gifts to bots.');
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (!member) return interaction.editReply('The receiver must be a member of this server.');
        return startGiftSend(interaction, member);
    }
};
