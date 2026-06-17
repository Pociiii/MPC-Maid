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

        const flexType =
            interaction.values[0];

        const filePath =
            path.join(

                __dirname,

                '..',
                '..',

                'data',
                'gifs',

                `${flexType}.json`

            );

        return approveGif(
            interaction,
            filePath,
            flexType === 'flex_w'
                ? 'Flex → White Male'
                : 'Flex → Black Male'
        );

    }

};