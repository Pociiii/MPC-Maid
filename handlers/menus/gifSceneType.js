const path =
    require('path');

const {
    approveGif
} = require(
    '../../utils/gifApproval'
);

module.exports = {

    async execute(
        interaction
    ) {

        const [

            ,
            category

        ] =
            interaction.customId.split(
                ':'
            );

        const sceneType =
            interaction.values[0];

        const filePath =
            path.join(

                __dirname,

                '..',
                '..',

                'data',
                'scenes',

                category,

                `${sceneType}.json`

            );

        return approveGif(

            interaction,

            filePath,

            `${category} → ${sceneType}`

        );

    }

};