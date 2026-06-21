const sceneTypes = [
    'foreplay',
    'oral',
    'sex',
    'finale'
];

const sceneGroups = {
    mf: {
        label: 'Scene MF',
        folder: 'scenes',
        types: sceneTypes,
        categories: {
            wm_wf: '⚪ White Male / ⚪ White Female',
            wm_bf: '⚪ White Male / ⚫ Black Female',
            bm_wf: '⚫ Black Male / ⚪ White Female',
            bm_bf: '⚫ Black Male / ⚫ Black Female'
        }
    },
    ff: {
        label: 'Scene FF',
        folder: 'scenes',
        types: sceneTypes,
        categories: {
            wf_wf: '⚪ White Female / ⚪ White Female',
            wf_bf: '⚪ White Female / ⚫ Black Female',
            bf_bf: '⚫ Black Female / ⚫ Black Female'
        }
    },
    mfm: {
        label: 'Scene MFM',
        folder: 'scenes_mfm',
        types: [
            'foreplay',
            'sex',
            'finale'
        ],
        categories: {
            wm_wm_wf: '⚪ White Male / ⚪ White Male / ⚪ White Female',
            wm_bm_wf: '⚪ White Male / ⚫ Black Male / ⚪ White Female',
            bm_bm_wf: '⚫ Black Male / ⚫ Black Male / ⚪ White Female',
            wm_wm_bf: '⚪ White Male / ⚪ White Male / ⚫ Black Female',
            wm_bm_bf: '⚪ White Male / ⚫ Black Male / ⚫ Black Female',
            bm_bm_bf: '⚫ Black Male / ⚫ Black Male / ⚫ Black Female'
        }
    },
    fmf: {
        label: 'Scene FMF',
        folder: 'scenes_fmf',
        types: [
            'foreplay',
            'sex',
            'finale'
        ],
        categories: {
            wm_wf_wf: '⚪ White Male / ⚪ White Female / ⚪ White Female',
            wm_wf_bf: '⚪ White Male / ⚪ White Female / ⚫ Black Female',
            wm_bf_bf: '⚪ White Male / ⚫ Black Female / ⚫ Black Female',
            bm_wf_wf: '⚫ Black Male / ⚪ White Female / ⚪ White Female',
            bm_wf_bf: '⚫ Black Male / ⚪ White Female / ⚫ Black Female',
            bm_bf_bf: '⚫ Black Male / ⚫ Black Female / ⚫ Black Female'
        }
    },
    fff: {
        label: 'Scene FFF',
        folder: 'scenes_fff',
        types: [
            'foreplay',
            'sex',
            'finale'
        ],
        categories: {
            wf_wf_wf: '⚪ White Female / ⚪ White Female / ⚪ White Female',
            wf_wf_bf: '⚪ White Female / ⚪ White Female / ⚫ Black Female',
            wf_bf_bf: '⚪ White Female / ⚫ Black Female / ⚫ Black Female',
            bf_bf_bf: '⚫ Black Female / ⚫ Black Female / ⚫ Black Female'
        }
    }
};

function getSceneGroup(
    group
) {

    return sceneGroups[group] ?? sceneGroups.mf;

}

function getSceneGroupKey(
    group
) {

    return sceneGroups[group]
        ? group
        : 'mf';

}

function getSceneCategoryLabel(
    group,
    category
) {

    const sceneGroup =
        getSceneGroup(
            group
        );

    return sceneGroup.categories[category] ?? category;

}

function getSceneCategoryName(
    group,
    category,
    sceneType = null
) {

    const sceneGroup =
        getSceneGroup(
            group
        );

    return [
        sceneGroup.label,
        getSceneCategoryLabel(
            group,
            category
        ),
        sceneType
    ]
        .filter(Boolean)
        .join(' - ');

}

module.exports = {
    sceneTypes,
    sceneGroups,
    getSceneGroup,
    getSceneGroupKey,
    getSceneCategoryLabel,
    getSceneCategoryName
};
