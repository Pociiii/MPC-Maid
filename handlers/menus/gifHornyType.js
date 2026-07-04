const {
    approveGif
} = require('../../utils/gifApproval');

const {
    castSymbol
} = require('../../data/sceneSubmitGroups');

const {
    getRuntimeDataPath
} = require('../../utils/runtimeData');

module.exports = {

    async execute(
        interaction
    ) {

        const hornyType =
            interaction.values[0];

        const filePath =
            getRuntimeDataPath(
                'gifs',
                'horny',
                `${hornyType}.json`
            );

        return approveGif(
            interaction,
            filePath,
            `Horny -> ${castSymbol[hornyType] ?? hornyType}`
        );

    }

};
