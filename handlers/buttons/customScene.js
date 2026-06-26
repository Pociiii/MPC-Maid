const {
    CHANNELS
} = require('../../data/constants');

const {
    buildBuilderEmbed,
    buildBuilderRows
} = require('../../features/custom-scene/embeds');

const {
    decodeParts,
    getCustomSceneCost
} = require('../../features/custom-scene/state');

const {
    scheduleCustomScene
} = require('../../features/custom-scene/scheduler');

const {
    getOrCreateUser,
    spendCoins
} = require('../../utils/users');

const {
    logWarning
} = require('../../utils/inboxLogger');

const finishingBuilders =
    new Set();

const finishedBuilders =
    new Set();

function rememberFinishedBuilder(
    builderKey
) {

    finishedBuilders.add(
        builderKey
    );

    const timeout =
        setTimeout(
            () =>
                finishedBuilders.delete(
                    builderKey
                ),
            2 * 60 * 60 * 1000
        );

    if (
        typeof timeout.unref === 'function'
    )
        timeout.unref();

}

async function guardOwner(
    interaction,
    ownerId
) {

    if (
        interaction.user.id === ownerId
    )
        return false;

    await interaction.reply({
        content:
            'Only the user building this custom scene can use these buttons.',
        flags:
            64
    });

    return true;

}

module.exports = {

    async execute(
        interaction
    ) {

        const [
            action,
            ownerId,
            cast,
            rawParts = ''
        ] =
            interaction.customId.split(
                ':'
            );

        if (
            await guardOwner(
                interaction,
                ownerId
            )
        )
            return;

        const parts =
            decodeParts(
                rawParts
            );

        if (
            action === 'customscene_cast' ||
            action === 'customscene_part' ||
            action === 'customscene_undo'
        ) {

            await interaction.update({
                content:
                    '',
                embeds: [
                    buildBuilderEmbed(
                        interaction,
                        cast,
                        parts
                    )
                ],
                components:
                    buildBuilderRows(
                        ownerId,
                        cast,
                        parts
                    )
            });

            return;

        }

        if (
            action !== 'customscene_finish'
        )
            return;

        const builderKey =
            interaction.message?.id ??
            `${ownerId}:${cast}:${rawParts}`;

        if (
            finishingBuilders.has(
                builderKey
            ) ||
            finishedBuilders.has(
                builderKey
            )
        ) {

            await interaction.reply({
                content:
                    'This custom scene is already being finished.',
                flags:
                    64
            });

            return;

        }

        if (
            parts.length === 0
        ) {

            await interaction.reply({
                content:
                    'Pick at least one scene part before finishing.',
                flags:
                    64
            });

            return;

        }

        finishingBuilders.add(
            builderKey
        );

        try {

            await interaction.deferUpdate();

            const channel =
                interaction.client.channels.cache.get(
                    CHANNELS.CUSTOM_SCENE
                ) ??
                await interaction.client.channels.fetch(
                    CHANNELS.CUSTOM_SCENE
                ).catch(
                    () => null
                );

            if (
                !channel
            ) {

                await interaction.editReply({
                    content:
                        'I could not find the custom-scene channel.',
                    embeds:
                        [],
                    components:
                        []
                });

                await logWarning(
                    interaction.client,
                    {
                        title:
                            'Custom Scene Channel Missing',
                        description:
                            `Could not find custom scene channel <#${CHANNELS.CUSTOM_SCENE}>.`,
                        fields: [
                            {
                                name:
                                    'User',
                                value:
                                    `<@${interaction.user.id}>`,
                                inline:
                                    true
                            },
                            {
                                name:
                                    'Parts',
                                value:
                                    String(
                                        parts.length
                                    ),
                                inline:
                                    true
                            }
                        ]
                    }
                );

                return;

            }

            const cost =
                getCustomSceneCost(
                    parts
                );

            const paid =
                await spendCoins(
                    interaction.user.id,
                    cost
                );

            if (
                !paid
            ) {

                const user =
                    await getOrCreateUser(
                        interaction.user.id
                    );

                await interaction.editReply({
                    content:
                        `You need **${cost} coins** to finish this custom scene. You have **${user.coins}**.`,
                    embeds: [
                        buildBuilderEmbed(
                            interaction,
                            cast,
                            parts
                        )
                    ],
                    components:
                        buildBuilderRows(
                            ownerId,
                            cast,
                            parts
                        )
                });

                return;

            }

            scheduleCustomScene(
                channel,
                interaction,
                cast,
                parts
            );

            rememberFinishedBuilder(
                builderKey
            );

            const finalEmbed =
                buildBuilderEmbed(
                    interaction,
                    cast,
                    parts
                );

            finalEmbed.setDescription(
`${finalEmbed.data.description}

Paid **${cost} coins**.
Posting in <#${CHANNELS.CUSTOM_SCENE}> across 30 minutes.`
            );

            await interaction.editReply({
                content:
                    '',
                embeds: [
                    finalEmbed
                ],
                components:
                    buildBuilderRows(
                        ownerId,
                        cast,
                        parts,
                        true
                    )
            });

        }
        finally {

            finishingBuilders.delete(
                builderKey
            );

        }

    }

};
