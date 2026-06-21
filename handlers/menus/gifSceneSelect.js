const {
    buildGifUrlModal
} = require('../../features/gif-submit/submissionFlow');

module.exports = {

    customId:
        'gif_scene_select',

    async execute(
        interaction
    ) {

        const group =
            interaction.customId.split(
                ':'
            )[1] ?? 'mf';

        const category =
            interaction.values[0];

        await interaction.showModal(
            buildGifUrlModal(
                `gif_submit:${group}:${category}`
            )
        );

    }

};
