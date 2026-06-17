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

        const hornyType =
            interaction.values[0];

        const filePath =
            path.join(

                __dirname,

                '..',
                '..',

                'data',
                'gifs',

                'horny',

                `${hornyType}.json`

            );

        return approveGif(
            interaction,
            filePath,
            `Horny → ${hornyType.toUpperCase()}`
        );

    }

};