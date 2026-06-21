const {
    buildGifUrlModal
} = require('../../features/gif-submit/submissionFlow');

module.exports = {

    customId:
        'gif_interaction_select',

    async execute(
        interaction
    ) {

        await interaction.showModal(
            buildGifUrlModal(
                `gif_submit:${interaction.values[0]}`
            )
        );

    }

};
