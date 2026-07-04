const path =
    require('path');

const {
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');

const {
    getGifCount
} = require('../../utils/gifs');

const {
    getSceneCategoryName,
    getSceneGroup,
    castSymbol
} = require('../../data/sceneSubmitGroups');

const {
    getRuntimeDataPath
} = require('../../utils/runtimeData');

function dataPath(
    ...parts
) {

    return getRuntimeDataPath(
        ...parts
    );

}

function buildSceneTypeUpdate(
    group,
    category,
    submitterId
) {

    const sceneGroup =
        getSceneGroup(
            group
        );

    const sceneFolder =
        dataPath(
            sceneGroup.folder,
            category
        );

    const menu =
        new StringSelectMenuBuilder()
            .setCustomId(
                `gif_scene_type:${group}:${category}:${submitterId}`
            )
            .setPlaceholder(
                'Select scene type'
            )
            .addOptions(
                ...sceneGroup.types.map(
                    (sceneType) => ({
                        label:
                            `${sceneType.charAt(0).toUpperCase()}${sceneType.slice(1)} (${getGifCount(
                                path.join(
                                    sceneFolder,
                                    `${sceneType}.json`
                                )
                            )})`,
                        value:
                            sceneType
                    })
                )
            );

    return {
        content:
            `Select ${getSceneCategoryName(
                group,
                category
            )} type:`,
        row:
            new ActionRowBuilder()
                .addComponents(
                    menu
                )
    };

}

function buildFlexTypeUpdate(
    submitterId
) {

    const flexWCount =
        getGifCount(
            dataPath(
                'gifs',
                'flex_w.json'
            )
        );

    const flexBCount =
        getGifCount(
            dataPath(
                'gifs',
                'flex_b.json'
            )
        );

    const menu =
        new StringSelectMenuBuilder()
            .setCustomId(
                `gif_flex_type:${submitterId}`
            )
            .setPlaceholder(
                'Select flex type'
            )
            .addOptions(
                {
                    label:
                        `${castSymbol.wm} (${flexWCount})`,
                    value:
                        'flex_w'
                },
                {
                    label:
                        `${castSymbol.bm} (${flexBCount})`,
                    value:
                        'flex_b'
                }
            );

    return {
        content:
            'Select flex type:',
        row:
            new ActionRowBuilder()
                .addComponents(
                    menu
                )
    };

}

function buildHornyTypeUpdate(
    submitterId
) {

    const hornyFolder =
        dataPath(
            'gifs',
            'horny'
        );

    const menu =
        new StringSelectMenuBuilder()
            .setCustomId(
                `gif_horny_type:${submitterId}`
            )
            .setPlaceholder(
                'Select horny type'
            )
            .addOptions(
                {
                    label:
                        `${castSymbol.wm} (${getGifCount(path.join(hornyFolder, 'wm.json'))})`,
                    value:
                        'wm'
                },
                {
                    label:
                        `${castSymbol.bm} (${getGifCount(path.join(hornyFolder, 'bm.json'))})`,
                    value:
                        'bm'
                },
                {
                    label:
                        `${castSymbol.wf} (${getGifCount(path.join(hornyFolder, 'wf.json'))})`,
                    value:
                        'wf'
                },
                {
                    label:
                        `${castSymbol.bf} (${getGifCount(path.join(hornyFolder, 'bf.json'))})`,
                    value:
                        'bf'
                }
            );

    return {
        content:
            'Select horny type:',
        row:
            new ActionRowBuilder()
                .addComponents(
                    menu
                )
    };

}

function getApprovalMenuUpdate(
    group,
    category,
    submitterId
) {

    const sceneGroup =
        getSceneGroup(
            group
        );

    if (
        sceneGroup.categories[category]
    )
        return buildSceneTypeUpdate(
            group,
            category,
            submitterId
        );

    if (
        category === 'flex'
    )
        return buildFlexTypeUpdate(
            submitterId
        );

    if (
        category === 'horny'
    )
        return buildHornyTypeUpdate(
            submitterId
        );

    return null;

}

module.exports = {
    dataPath,
    getApprovalMenuUpdate
};
