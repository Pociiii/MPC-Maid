const {
    SlashCommandBuilder
} = require('discord.js');

const {
    COOLDOWNS,
    ECONOMY
} = require('../../data/constants');

const {
    handleCooldown
} = require('../../utils/cooldowns');

const {
    addXP,
    getOrCreateUser,
    spendCoins
} = require('../../utils/users');

const {
    buildDrinkEmbed,
    getCommandGif,
    getVisibleOnlineMembers,
    postDrinkMoment
} = require('../../features/social/partyCommands');

const {
    incrementAchievementProgress,
    syncUserAchievementCounters
} = require('../../features/achievements/achievements');

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'drink'
            )
            .setDescription(
                'Buy a round and give everyone online a tiny XP toast'
            ),

    async execute(
        interaction
    ) {

        const user =
            await getOrCreateUser(
                interaction.user.id
            );

        if (
            user.coins < ECONOMY.DRINK_COST
        ) {

            await interaction.reply({
                content:
                    `You need **${ECONOMY.DRINK_COST} coins** to buy a round. You have **${user.coins}**.`,
                flags:
                    64
            });

            return;

        }

        if (
            await handleCooldown(
                interaction,
                interaction.commandName,
                COOLDOWNS.DRINK
            )
        )
            return;

        await interaction.deferReply();

        const recipients =
            await getVisibleOnlineMembers(
                interaction
            );

        const paid =
            await spendCoins(
                interaction.user.id,
                ECONOMY.DRINK_COST
            );

        if (
            !paid
        ) {

            await interaction.editReply({
                content:
                    `You need **${ECONOMY.DRINK_COST} coins** to buy a round.`
            });

            return;

        }

        await Promise.all(
            recipients.map(
                async (member) => {

                    await getOrCreateUser(
                        member.id
                    );

                    await addXP(
                        member.id,
                        ECONOMY.DRINK_XP_REWARD
                    );

                    await syncUserAchievementCounters(
                        interaction.client,
                        member.id,
                        [
                            'xp_earned'
                        ]
                    );

                }
            )
        );

        const gif =
            getCommandGif(
                'drink',
                recipients.map(
                    (member) =>
                        member.id
                )
            );

        await interaction.editReply({
            embeds: [
                buildDrinkEmbed(
                    interaction,
                    {
                        cost:
                            ECONOMY.DRINK_COST,
                        gif,
                        recipientCount:
                            recipients.length,
                        xpReward:
                            ECONOMY.DRINK_XP_REWARD
                    }
                )
            ]
        });

        await incrementAchievementProgress(
            interaction.client,
            interaction.user.id,
            'drinks_bought'
        );

        await postDrinkMoment(
            interaction,
            {
                gif,
                recipientCount:
                    recipients.length,
                xpReward:
                    ECONOMY.DRINK_XP_REWARD
            }
        ).catch(
            (error) =>
                console.error(
                    'DRINK MOMENT ERROR',
                    error
                )
        );

    }

};
