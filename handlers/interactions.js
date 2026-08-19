const handleSpank =
    require('./buttons/spank');

const handleBlowKiss =
    require('./buttons/blowkiss');

const handleBrofist =
    require('./buttons/brofist');

const handleHornyHelp =
    require('./buttons/hornyHelp');

const customScene =
    require('./buttons/customScene');

const pornScene =
    require('./buttons/pornScene');

const pornSceneSpank =
    require('./buttons/pornSceneSpank');

const commandsPornCareerInfo =
    require('./buttons/commandsPornCareerInfo');

const commandsPregnancyInfo =
    require('./buttons/commandsPregnancyInfo');

const commandsRelationshipInfo =
    require('./buttons/commandsRelationshipInfo');

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
    buyFertilityPill
} = require('../features/shop/fertilityShop');
const {
    cancelGiftInteraction,
    confirmGiftPurchase,
    confirmGiftSend,
    showGiftPurchaseConfirmation,
    showGiftSendConfirmation,
    showReceivedCollection
} = require('../features/gifts/giftSystem');

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
    handleHoldemAction
} = require('../features/casino/holdem');

const {
    handleSlotsAction
} = require('../features/casino/slots');

const {
    handleDailyWyrVote
} = require('../features/daily-wyr/dailyWyr');

const {
    handleProfileLike
} = require('../features/profile/profileLikes');

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

const gifSubmitTitles =
    require('./buttons/gifSubmitTitles');

const gifSceneSelect =
    require('./menus/gifSceneSelect');

const gifInteractionSelect =
    require('./menus/gifInteractionSelect');

const gifSceneTitlePool =
    require('./menus/gifSceneTitlePool');

const commandsSection =
    require('./menus/commandsSection');

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
    require('./buttons/gifreject');

const gifRejectModal =
    require('./modals/gifRejectModal');

const memberCard =
    require('./buttons/memberCard');

const {
    logError
} = require('../utils/inboxLogger');

const {
    approveSceneTitle,
    rejectSceneTitle,
    showSceneTitleRejectModal,
    submitSceneTitleSuggestion
} = require('../features/gif-submit/sceneTitleSubmission');

const gifAdminInspect =
    require('../features/gif-admin/inspect');

const {
    handleLotteryButton
} = require('../features/lottery/lottery');

const {
    handleJoin: handleCommunityProductionJoin
} = require('../features/community-production/communityProduction');

const {
    handleStudioBuy,
    handleStudioClose,
    handleStudioCloseCancel,
    handleStudioCloseConfirm,
    handleStudioPendingCancelConfirm,
    handleStudioPendingCancelSelect,
    handleStudioPendingRequests,
    handleStudioReopen,
    handleStudioStaff,
    handleStudioStaffBack,
    handleStudioStaffFireConfirm,
    handleStudioStaffFireSelect,
    handleStudioStaffHireSelect,
    handleStudioUpgrade,
    handleStudioUpgradeConfirm
} = require('../features/player-studios/studios');

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

function isExpiredInteractionError(
    error
) {

    return error?.code === 10062 ||
        error?.rawError?.code === 10062;

}

function isInteractionAckTimeout(
    error
) {

    const message =
        String(
            error?.message ?? ''
        );

    return error?.name === 'ConnectTimeoutError' ||
        message.includes(
            'Connect Timeout Error'
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

            case 'brofist':
                await handleBrofist(
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

            case 'holdem_peek':
                await handleHoldemAction(
                    interaction,
                    'peek',
                    interaction.customId.split(
                        ':'
                    )[1]
                );
                return true;

            case 'holdem_advance':
                await handleHoldemAction(
                    interaction,
                    'advance',
                    interaction.customId.split(
                        ':'
                    )[1]
                );
                return true;

            case 'holdem_fold':
                await handleHoldemAction(
                    interaction,
                    'fold',
                    interaction.customId.split(
                        ':'
                    )[1]
                );
                return true;

            case 'slots_spin':
                await handleSlotsAction(
                    interaction,
                    'spin',
                    interaction.customId.split(
                        ':'
                    )[1]
                );
                return true;

            case 'slots_leave':
                await handleSlotsAction(
                    interaction,
                    'leave',
                    interaction.customId.split(
                        ':'
                    )[1]
                );
                return true;

            case 'daily_wyr_vote':
                await handleDailyWyrVote(
                    interaction
                );
                return true;

            case 'profile_like':
                await handleProfileLike(
                    interaction
                );
                return true;

            case 'lottery_open_shop':
            case 'lottery_rules':
            case 'lottery_buy_1':
            case 'lottery_buy_5':
            case 'lottery_buy_max':
            case 'lottery_view_tickets':
            case 'lottery_refresh':
                await handleLotteryButton(
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

            case 'pornscene_spank':
                await pornSceneSpank(
                    interaction
                );
                return true;

            case 'community_join':

                await handleCommunityProductionJoin(
                    interaction
                );

                return true;

            case 'studio_buy':
                await handleStudioBuy(
                    interaction
                );
                return true;

            case 'studio_reopen':
                await handleStudioReopen(
                    interaction
                );
                return true;

            case 'studio_close':
                await handleStudioClose(
                    interaction
                );
                return true;

            case 'studio_close_confirm':
                await handleStudioCloseConfirm(
                    interaction
                );
                return true;

            case 'studio_close_cancel':
                await handleStudioCloseCancel(
                    interaction
                );
                return true;

            case 'studio_staff':
                await handleStudioStaff(
                    interaction
                );
                return true;

            case 'studio_staff_back':
                await handleStudioStaffBack(
                    interaction
                );
                return true;

            case 'studio_pending_requests':
            case 'studio_pending_cancel_back':
                await handleStudioPendingRequests(interaction);
                return true;

            case 'studio_pending_cancel_confirm':
                await handleStudioPendingCancelConfirm(interaction);
                return true;

            case 'studio_upgrade':
                await handleStudioUpgrade(interaction);
                return true;

            case 'studio_upgrade_confirm':
                await handleStudioUpgradeConfirm(interaction);
                return true;

            case 'studio_upgrade_cancel':
            case 'studio_staff_fire_cancel':
                await handleStudioStaffBack(interaction);
                return true;

            case 'studio_staff_fire_confirm':
                await handleStudioStaffFireConfirm(interaction);
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

            case 'commands_relationship_info':
                await commandsRelationshipInfo.execute(
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

            case 'gift_buy':
                await confirmGiftPurchase(interaction);
                return true;

            case 'fertility_pill_buy': {

                const [, ownerId] = interaction.customId.split(':');

                await buyFertilityPill(interaction, ownerId);

                return true;

            }

            case 'gift_send_confirm':
                await confirmGiftSend(interaction);
                return true;

            case 'gift_cancel_shop':
            case 'gift_cancel_send':
                await cancelGiftInteraction(interaction);
                return true;

            case 'gift_collection':
                await showReceivedCollection(interaction, interaction.customId.split(':')[1]);
                return true;

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

            case 'gifsubmit_titles':

                await gifSubmitTitles.execute(
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

            case 'scenetitleapprove':

                await approveSceneTitle(
                    interaction
                );

                return true;

            case 'scenetitlereject':

                await showSceneTitleRejectModal(
                    interaction
                );

                return true;
            
            case 'membercard':

                await memberCard.execute(
                    interaction
                );

                return true;

            case 'gifadmin_prev':
            case 'gifadmin_next':

                await gifAdminInspect.handleNavigation(
                    interaction
                );

                return true;

            case 'gifadmin_move':

                await gifAdminInspect.showMoveCategoryMenu(
                    interaction
                );

                return true;

            case 'gifadmin_delete':

                await gifAdminInspect.showDeleteConfirmation(
                    interaction
                );

                return true;

            case 'gifadmin_delete_confirm':

                await gifAdminInspect.confirmDelete(
                    interaction
                );

                return true;

            case 'gifadmin_delete_cancel':

                await gifAdminInspect.cancelDelete(
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

            case 'commands_section':

                await commandsSection.execute(
                    interaction
                );

                return true;

            case 'gif_interaction_select':

                await gifInteractionSelect.execute(
                    interaction
                );

                return true;

            case 'gif_scene_title_pool':

                await gifSceneTitlePool.execute(
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

            case 'studio_staff_hire_select':

                await handleStudioStaffHireSelect(
                    interaction
                );

                return true;

            case 'studio_staff_fire_select':

                await handleStudioStaffFireSelect(
                    interaction
                );

                return true;

            case 'studio_pending_cancel_select':

                await handleStudioPendingCancelSelect(
                    interaction
                );

                return true;

            case 'shop_booster': {

                const [
                    ,
                    ownerId
                ] =
                    interaction.customId.split(
                        ':'
                    );

                const [
                    stat,
                    tier
                ] =
                    interaction.values[0].split(
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

            case 'gift_shop':
                await showGiftPurchaseConfirmation(interaction);
                return true;

            case 'gift_send_select':
                await showGiftSendConfirmation(interaction);
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

            case 'gifadmin_dest_cat':

                await gifAdminInspect.handleDestinationCategory(
                    interaction
                );

                return true;

            case 'gifadmin_dest_sub':

                await gifAdminInspect.handleDestinationSubcategory(
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
        if (
            interaction.customId.startsWith(
                'scene_title_submit:'
            )
        ) {

            await submitSceneTitleSuggestion(
                interaction
            );

            return true;

        }
        if (
            interaction.customId.startsWith(
                'scenetitlerejectmodal:'
            )
        ) {

            await rejectSceneTitle(
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

        if (
            !isExpiredInteractionError(
                error
            ) &&
            !isInteractionAckTimeout(
                error
            )
        ) {

            await replyInteractionError(
                interaction
            ).catch(
                () => null
            );

        }

        void logError(
            interaction.client,
            {
                title:
                    'Interaction Error',
                error,
                fields: [
                    {
                        name:
                            '\uD83D\uDD22 Type',
                        value:
                            interaction.type?.toString() || 'Unknown',
                        inline:
                            true
                    },
                    {
                        name:
                            '\uD83C\uDD94 Custom ID',
                        value:
                            interaction.customId || 'None',
                        inline:
                            true
                    },
                    {
                        name:
                            '\uD83D\uDC64 User',
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
