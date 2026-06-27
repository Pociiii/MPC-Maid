const {
    buildSceneTitleModal
} = require('../../features/gif-submit/sceneTitleSubmission');

module.exports = {

    customId:
        'gif_scene_title_pool',

    async execute(
        interaction
    ) {

        await interaction.showModal(
            buildSceneTitleModal(
                interaction.values[0]
            )
        );

    }

};
