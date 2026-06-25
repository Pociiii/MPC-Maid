const {
    buildCommandSectionEmbed
} = require('../../features/commands/commandGuide');

module.exports = {

    async execute(
        interaction
    ) {

        await interaction.reply({
            embeds: [
                buildCommandSectionEmbed(
                    interaction.values[0]
                )
            ],
            flags:
                64
        });

    }

};
