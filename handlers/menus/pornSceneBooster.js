const {
    sendPornSceneRequest
} = require('../../features/porn-career/pornSceneRequest');

const {
    hasPendingRequest,
    isBusy
} = require('../../utils/pornScenes');

const {
    hasActiveStudioNpc
} = require('../../database/studios');

function parseBooster(
    selected
) {

    if (
        selected === 'none'
    )
        return null;

    const [
        stat,
        tier
    ] =
        selected.split(
            ':'
        );

    return {
        stat,
        tier:
            Number(
                tier
            )
    };

}

module.exports = {

    async execute(
        interaction
    ) {

        const [
            ,
            targetId,
            sceneCategory
        ] =
            interaction.customId.split(
                ':'
            );

        const booster =
            parseBooster(
                interaction.values[0]
            );

        await interaction.deferUpdate();

        if (
            hasPendingRequest(
                interaction.user.id,
                targetId
            )
        ) {

            await interaction.editReply({
                content:
                    'You already have a pending porn scene request with this user.',
                embeds:
                    [],
                components:
                    [],
                attachments:
                    []
            });

            return;

        }

        if (
            isBusy(
                interaction.user.id
            ) &&
            !await hasActiveStudioNpc(
                interaction.user.id,
                'personal_agent'
            )
        ) {

            await interaction.editReply({
                content:
                    'You are already filming another scene. Finish it before sending a new request.',
                embeds:
                    [],
                components:
                    [],
                attachments:
                    []
            });

            return;

        }

        try {

            await sendPornSceneRequest(
                interaction,
                targetId,
                sceneCategory,
                booster
            );

            await interaction.editReply({
                content:
                    `<@${targetId}> has been sent the scene request.`,
                embeds:
                    [],
                components:
                    [],
                attachments:
                    []
            });

        }
        catch (error) {

            await interaction.editReply({
                content:
                    error.message === 'Booster is no longer available.'
                        ? 'That booster is no longer in your inventory.'
                        : 'I could not DM that user. They may have DMs closed.',
                embeds:
                    [],
                components:
                    [],
                attachments:
                    []
            });

        }

    }

};
