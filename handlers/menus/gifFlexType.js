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

        const flexType =
            interaction.values[0];

        const filePath =
            getRuntimeDataPath(
                'gifs',
                `${flexType}.json`
            );

        return approveGif(
            interaction,
            filePath,
            flexType === 'flex_w'
                ? `Flex -> ${castSymbol.wm}`
                : `Flex -> ${castSymbol.bm}`
        );

    }

};
