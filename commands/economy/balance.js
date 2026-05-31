const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your balance'),

    async execute(interaction) {

        const userId = interaction.user.id;

        db.get(
            'SELECT coins FROM users WHERE id = ?',
            [userId],
            async (err, row) => {

                if (err) {
                    console.error(err);
                    return interaction.reply({
                        content: 'Database error.',
                        ephemeral: true
                    });
                }

                if (!row) {

                    db.run(
                        'INSERT INTO users (id, coins) VALUES (?, ?)',
                        [userId, 0]
                    );

                    return interaction.reply(
                        '💰 You have 0 coins.'
                    );
                }

                await interaction.reply(
                    `💰 You have ${row.coins} coins.`
                );
            }
        );
    }
};