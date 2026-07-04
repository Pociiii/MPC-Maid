const path =
    require('path');

const {
    approveGif
} = require(
    '../../utils/gifApproval'
);

const {
    getSceneCategoryName,
    getSceneGroup,
    getSceneGroupKey
} = require(
    '../../data/sceneSubmitGroups'
);

const {
    getRuntimeDataPath
} = require('../../utils/runtimeData');

module.exports = {

    async execute(
        interaction
    ) {

        const parts =
            interaction.customId.split(
                ':'
            );

        const group =
            parts.length >= 4
                ? getSceneGroupKey(
                    parts[1]
                )
                : 'mf';

        const category =
            parts.length >= 4
                ? parts[2]
                : parts[1];

        const sceneType =
            interaction.values[0];

        const sceneGroup =
            getSceneGroup(
                group
            );

        const filePath =
            getRuntimeDataPath(
                sceneGroup.folder,
                category,
                `${sceneType}.json`
            );

        return approveGif(
            interaction,
            filePath,
            getSceneCategoryName(
                group,
                category,
                sceneType
            )
        );

    }

};
