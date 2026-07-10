const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    getRandomColor
} = require('../../data/constants');

const ROLES =
    require('../../data/roles.json');

const emojis =
    require('../../utils/emojis');

module.exports = {

    data:
        new SlashCommandBuilder()

            .setName('membercardpanel')

            .setDescription(
                'Post member card panel'
            ),

    async execute(interaction) {

        await interaction.deferReply({

            flags:
                64

        });

        const embed =
            createEmbed({

                color:
                    getRandomColor(),

                title:
                    `${emojis.mpc_logo} MPC Member Card`,

                description:

`Generate your official **MPC** membership card.

The card style is picked from your MPC role.

Card priority:
- <@&${ROLES.MPC_CREW}> gets the crew card.
- <@&${ROLES.STILETTO_GANG}> and <@&${ROLES.TAILORED_FEW}> get their gang card.
- <@&${ROLES.MIDNIGHT_CIRCLE}> gets the Midnight Circle card.
- No card role means the regular member card.

Pick your roles first if you want at least the Midnight Circle card.

Remember to change your nick to your in-game name first.`,

                timestamp:
                    true

            });

        const row =
            new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                        .setCustomId(
                            'membercard'
                        )

                        .setLabel(
                            'Get Card'
                        )

                        .setEmoji(
                            emojis.mpc_logo
                        )

                        .setStyle(
                            ButtonStyle.Primary
                        )

                );

        const post =
            await interaction.channel.send({

                embeds: [embed],

                components: [row]

            });

        await interaction.editReply({

            content:
                `Member card panel posted: ${post.url}`

        });

    }

};
