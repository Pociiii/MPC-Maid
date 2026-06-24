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

const commandsPregnancyInfo =
    require('./buttons/commandsPregnancyInfo');

const {
    buildLeaderboard
} = require('../features/leaderboard/leaderboard');

const {
    trainStat
} = require('../features/porn-career/training');

const {
    buyShopBooster
} = require('../features/shop/boosterShop');

const {
    handleAchievementsView
} = require('../features/achievements/viewer');

const {
    handleBreedDecision,
    handleCarrierChoice
} = require('../features/pregnancy/pregnancyRequest');

const {
    handleBlackjackAction
} = require('../features/casino/blackjack');

const {
    handleSpankDilli
} = require('../features/casino/spankDilli');

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

const pornSceneBooster =
    require('./menus/pornSceneBooster');

const gifReject =
    require('./buttons/gifReject');

const gifRejectModal =
    require('./modals/gifRejectModal');

const memberCard =
    require('./buttons/memberCard');

const {
    logError
} = require('../utils/inboxLogger');

async function replyInteractionError(
    interaction
) {

    const payload = {
        content:
            'There was an error handling this interaction.',
        flags:
            64
    };

    if (
        interaction.replied ||
        interaction.deferred
    ) {

        await interaction.followUp(
            payload
        );

        return;

    }

    await interaction.reply(
        payload
    );

}

async function routeInteraction(
    interaction
) {

    if (interaction.isButton()) {

        const action = interaction.customId .split(':')[0];

        switch (action) {

            case 'blowkiss':
                await handleBlowKiss(
                    interaction
                );
                return true;

            case 'spank':
            case 'spank_male':
            case 'spank_female':
                await handleSpank(
                    interaction
                );
                return true;

            case 'horny_help':
                await handleHornyHelp(
                    interaction
                );
                return true;

            case 'blackjack_hit':
                await handleBlackjackAction(
                    interaction,
                    'hit',
                    interaction.customId.split(
                        ':'
                    )[1]
                );
                return true;

            case 'blackjack_stand':
                await handleBlackjackAction(
                    interaction,
                    'stand',
                    interaction.customId.split(
                        ':'
                    )[1]
                );
                return true;

            case 'spank_dilli':
                await handleSpankDilli(
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

            case 'commands_pregnancy_info':
                await commandsPregnancyInfo.execute(
                    interaction
                );
                return true;

            case 'leaderboard_ranking':
            case 'leaderboard_scenes':
            case 'leaderboard_coins':
            case 'leaderboard_spanks':
            case 'leaderboard_kisses':
            case 'leaderboard_helps':
            case 'leaderboard_achievements':
                await interaction.deferUpdate();

                await interaction.editReply(
                    await buildLeaderboard(
                        interaction,
                        action.split(
                            '_'
                        )[1]
                    )
                );
                return true;

            case 'train': {

                const [
                    ,
                    ownerId,
                    stat
                ] =
                    interaction.customId.split(
                        ':'
                    );

                await trainStat(
                    interaction,
                    ownerId,
                    stat
                );

                return true;

            }

            case 'shop_booster': {

                const [
                    ,
                    ownerId,
                    stat,
                    tier
                ] =
                    interaction.customId.split(
                        ':'
                    );

                await buyShopBooster(
                    interaction,
                    ownerId,
                    stat,
                    tier
                );

                return true;

            }

            case 'achievements_view':
                await handleAchievementsView(
                    interaction
                );
                return true;

            case 'breed_carrier':
                await handleCarrierChoice(
                    interaction
                );
                return true;

            case 'breed_accept':
                await handleBreedDecision(
                    interaction,
                    true
                );
                return true;

            case 'breed_decline':
                await handleBreedDecision(
                    interaction,
                    false
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

            case 'gif_info_select':

                await interaction.deferUpdate();

                await interaction.editReply(
                    gifSubmitInfo.buildGifInfoReply(
                        interaction.values[0]
                    )
                );

                return true;

            case 'pornscene_booster':

                await pornSceneBooster.execute(
                    interaction
                );

                return true;

            case 'leaderboard_select':

                await interaction.deferUpdate();

                await interaction.editReply(
                    await buildLeaderboard(
                        interaction,
                        interaction.values[0]
                    )
                );

                return true;

            case 'customscene_cast':

                interaction.customId =
                    `${interaction.customId}:${interaction.values[0]}`;

                await customScene.execute(
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

}

module.exports = async (
    interaction
) => {

    try {

        return await routeInteraction(
            interaction
        );

    }
    catch (error) {

        console.error(
            'INTERACTION ERROR'
        );
        console.error(
            error
        );

        await replyInteractionError(
            interaction
        ).catch(
            () => null
        );

        void logError(
            interaction.client,
            {
                title:
                    'Interaction Error',
                error,
                fields: [
                    {
                        name:
                            'Type',
                        value:
                            interaction.type?.toString() || 'Unknown',
                        inline:
                            true
                    },
                    {
                        name:
                            'Custom ID',
                        value:
                            interaction.customId || 'None',
                        inline:
                            true
                    },
                    {
                        name:
                            'User',
                        value:
                            `${interaction.user.tag} (${interaction.user.id})`,
                        inline:
                            false
                    }
                ]
            }
        );

        return true;

    }

};
