module.exports = {

    async execute(
        interaction
    ) {

        await interaction.reply({

            content:
                `Horny type selected: ${interaction.values[0]}`,

            flags: 64

        });

    }

};