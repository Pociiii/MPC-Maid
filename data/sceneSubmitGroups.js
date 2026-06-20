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
        categories: {
            wm_wf: 'WM / WF',
            wm_bf: 'WM / BF',
            bm_wf: 'BM / WF',
            bm_bf: 'BM / BF',
            wf_wf: 'WF / WF',
            wf_bf: 'WF / BF',
            bf_bf: 'BF / BF'
        }
    },
    mfm: {
        label: 'Scene MFM',
        folder: 'scenes_mfm',
        categories: {
            wm_wm_wf: 'WM / WM / WF',
            wm_bm_wf: 'WM / BM / WF',
            bm_bm_wf: 'BM / BM / WF',
            wm_wm_bf: 'WM / WM / BF',
            wm_bm_bf: 'WM / BM / BF',
            bm_bm_bf: 'BM / BM / BF'
        }
    },
    fmf: {
        label: 'Scene FMF',
        folder: 'scenes_fmf',
        categories: {
            wm_wf_wf: 'WM / WF / WF',
            wm_wf_bf: 'WM / WF / BF',
            wm_bf_bf: 'WM / BF / BF',
            bm_wf_wf: 'BM / WF / WF',
            bm_wf_bf: 'BM / WF / BF',
            bm_bf_bf: 'BM / BF / BF'
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
