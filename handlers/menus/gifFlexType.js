module.exports = {

    async execute(
        interaction
    ) {

        await interaction.reply({

            content:
                `Flex type selected: ${interaction.values[0]}`,

            flags: 64

        });

    }

};