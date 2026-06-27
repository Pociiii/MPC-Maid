const {
    buildSceneTitlePoolReply
} = require('../../features/gif-submit/sceneTitleSubmission');

module.exports = {

    customId:
        'gifsubmit_titles',

    async execute(
        interaction
    ) {

        await interaction.reply(
            buildSceneTitlePoolReply()
        );

    }

};
