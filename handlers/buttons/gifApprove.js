const {
    approveGif
} = require(
    '../../utils/gifApproval'
);

const {
    getSceneGroupKey,
    sceneGroups
} = require(
    '../../data/sceneSubmitGroups'
);

const {
    dataPath,
    getApprovalMenuUpdate
} = require(
    '../../features/gif-submit/approvalMenus'
);

function parseApprovalId(
    customId
) {

    const parts =
        customId.split(
            ':'
        );

    const hasSceneGroup =
        parts.length >= 4 &&
        Boolean(
            sceneGroups[parts[1]]
        );

    return {
        group:
            hasSceneGroup
                ? getSceneGroupKey(
                    parts[1]
                )
                : 'mf',
        category:
            hasSceneGroup
                ? parts[2]
                : parts[1],
        submitterId:
            hasSceneGroup
                ? parts[3]
                : parts[2]
    };

}

module.exports = {

    async execute(
        interaction
    ) {

        const {
            group,
            category,
            submitterId
        } =
            parseApprovalId(
                interaction.customId
            );

        const menuUpdate =
            getApprovalMenuUpdate(
                group,
                category,
                submitterId
            );

        if (
            menuUpdate
        ) {

            return interaction.update({
                content:
                    menuUpdate.content,
                embeds:
                    interaction.message.embeds,
                components: [
                    menuUpdate.row
                ]
            });

        }

        return approveGif(
            interaction,
            dataPath(
                'gifs',
                `${category}.json`
            ),
            category
        );

    }

};
