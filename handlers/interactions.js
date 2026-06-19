const handleSpank =
    require('./buttons/spank');

const handleBlowKiss =
    require('./buttons/blowkiss');

const handleHornyHelp =
    require('./buttons/hornyHelp');

const customScene =
    require('./buttons/customScene');

const pornScene =
    require('./buttons/pornScene');

const commandsPornCareerInfo =
    require('./buttons/commandsPornCareerInfo');

const handleRelationshipAccept =
    require('./buttons/relationshipAccept');

const handleRelationshipDecline =
    require('./buttons/relationshipDecline');

const gifSubmitScenes =
    require('./buttons/gifSubmitSceneCategories');

const gifSubmitInteractions =
    require('./buttons/gifSubmitInteractions');

const gifSubmitInfo =
    require('./buttons/gifSubmitInfo');

const gifSceneSelect =
    require('./menus/gifSceneSelect');

const gifInteractionSelect =
    require('./menus/gifInteractionSelect');

const gifSubmitModal =
    require('./modals/gifSubmit');

const gifApprove =
    require('./buttons/gifApprove');

const gifSceneType =
    require('./menus/gifSceneType');

const gifFlexType =
    require('./menus/gifFlexType');

const gifHornyType =
    require('./menus/gifHornyType');

const gifReject =
    require('./buttons/gifReject');

const gifRejectModal =
    require('./modals/gifRejectModal');

const memberCard =
    require('./buttons/memberCard');
module.exports = async (
    interaction
) => {

    if (interaction.isButton()) {

        const action = interaction.customId .split(':')[0];

        switch (action) {

            case 'blowkiss':
                await handleBlowKiss(
                    interaction
                );
                return true;

            case 'spank':
                await handleSpank(
                    interaction
                );
                return true;

            case 'horny_help':
                await handleHornyHelp(
                    interaction
                );
                return true;

            case 'customscene_cast':
            case 'customscene_part':
            case 'customscene_undo':
            case 'customscene_finish':
                await customScene.execute(
                    interaction
                );
                return true;

            case 'pornscene_accept':
            case 'pornscene_decline':
                await pornScene.execute(
                    interaction
                );
                return true;

            case 'commands_porncareer_info':
                await commandsPornCareerInfo.execute(
                    interaction
                );
                return true;

            case 'relationship_accept':

                await handleRelationshipAccept.execute(
                    interaction
                );

                return true;

            case 'relationship_decline':

                await handleRelationshipDecline.execute(
                    interaction
                );

                return true;
            
            case 'gifsubmit_scenes':

                await gifSubmitScenes.execute(
                    interaction
                );

            return true;

            case 'gifsubmit_interactions':

                await gifSubmitInteractions.execute(
                    interaction
                );

            return true;

            case 'gifsubmit_info':

                await gifSubmitInfo.execute(
                    interaction
                );

            return true;

            case 'gifapprove':

                await gifApprove.execute(
                    interaction
                );

                return true;
            
            case 'gifreject':

                await gifReject.execute(
                    interaction
                );

                return true;
            
            case 'membercard':

                await memberCard.execute(
                    interaction
                );

                return true;
        }

    }

    if (
        interaction.isStringSelectMenu()
    ) {

        const action =
            interaction.customId.split(
                ':'
            )[0];

        switch (
            action
        ) {

            case 'gif_scene_select':

                await gifSceneSelect.execute(
                    interaction
                );

                return true;

            case 'gif_interaction_select':

                await gifInteractionSelect.execute(
                    interaction
                );

                return true;
            case 'gif_scene_type':

                await gifSceneType.execute(
                    interaction
                );

                return true;

            case 'gif_flex_type':

                await gifFlexType.execute(
                    interaction
                );

                return true;

            case 'gif_horny_type':

                await gifHornyType.execute(
                    interaction
                );

                return true;
            
        }

    }

    if (
        interaction.isModalSubmit()
    ) {

        if (

            interaction.customId.startsWith(
                'gif_submit:'
            )

        ) {

            await gifSubmitModal.execute(
                interaction
            );

            return true;

        }
        if (
            interaction.customId.startsWith(
                'gifrejectmodal:'
            )
        ) {

            await gifRejectModal.execute(
                interaction
            );

            return true;

        }
    }

    return false;

};
