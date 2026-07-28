const sceneTypes = [
    'foreplay',
    'oral',
    'sex',
    'finale'
];

const castSymbol = {
    wm: '\u26AA\u2642\uFE0F',
    wf: '\u26AA\u2640\uFE0F',
    bm: '\u26AB\u2642\uFE0F',
    bf: '\u26AB\u2640\uFE0F'
};

const canonicalCastOrder = [
    'wm',
    'bm',
    'wf',
    'bf'
];

function canonicalizeCastCategories(
    categories
) {

    return [...categories].sort(
        (first, second) =>
            canonicalCastOrder.indexOf(
                first
            ) -
            canonicalCastOrder.indexOf(
                second
            )
    ).join(
        '_'
    );

}

function castLabel(
    ...parts
) {

    return parts
        .map(
            (part) =>
                castSymbol[part] ?? part
        )
        .join(
            ' / '
        );

}

const sceneGroups = {
    mf: {
        label:
            'Scene MF',
        folder:
            'scenes',
        types:
            sceneTypes,
        categories: {
            wm_wf:
                castLabel(
                    'wm',
                    'wf'
                ),
            wm_bf:
                castLabel(
                    'wm',
                    'bf'
                ),
            bm_wf:
                castLabel(
                    'bm',
                    'wf'
                ),
            bm_bf:
                castLabel(
                    'bm',
                    'bf'
                )
        }
    },
    ff: {
        label:
            'Scene FF',
        folder:
            'scenes',
        types:
            sceneTypes,
        categories: {
            wf_wf:
                castLabel(
                    'wf',
                    'wf'
                ),
            wf_bf:
                castLabel(
                    'wf',
                    'bf'
                ),
            bf_bf:
                castLabel(
                    'bf',
                    'bf'
                )
        }
    },
    mfm: {
        label:
            'Scene MFM',
        folder:
            'scenes_mfm',
        types: [
            'foreplay',
            'sex',
            'finale'
        ],
        categories: {
            wm_wm_wf:
                castLabel(
                    'wm',
                    'wm',
                    'wf'
                ),
            wm_bm_wf:
                castLabel(
                    'wm',
                    'bm',
                    'wf'
                ),
            bm_bm_wf:
                castLabel(
                    'bm',
                    'bm',
                    'wf'
                ),
            wm_wm_bf:
                castLabel(
                    'wm',
                    'wm',
                    'bf'
                ),
            wm_bm_bf:
                castLabel(
                    'wm',
                    'bm',
                    'bf'
                ),
            bm_bm_bf:
                castLabel(
                    'bm',
                    'bm',
                    'bf'
                )
        }
    },
    fmf: {
        label:
            'Scene FMF',
        folder:
            'scenes_fmf',
        types: [
            'foreplay',
            'sex',
            'finale'
        ],
        categories: {
            wm_wf_wf:
                castLabel(
                    'wm',
                    'wf',
                    'wf'
                ),
            wm_wf_bf:
                castLabel(
                    'wm',
                    'wf',
                    'bf'
                ),
            wm_bf_bf:
                castLabel(
                    'wm',
                    'bf',
                    'bf'
                ),
            bm_wf_wf:
                castLabel(
                    'bm',
                    'wf',
                    'wf'
                ),
            bm_wf_bf:
                castLabel(
                    'bm',
                    'wf',
                    'bf'
                ),
            bm_bf_bf:
                castLabel(
                    'bm',
                    'bf',
                    'bf'
                )
        }
    },
    fff: {
        label:
            'Scene FFF',
        folder:
            'scenes_fff',
        types: [
            'foreplay',
            'sex',
            'finale'
        ],
        categories: {
            wf_wf_wf:
                castLabel(
                    'wf',
                    'wf',
                    'wf'
                ),
            wf_wf_bf:
                castLabel(
                    'wf',
                    'wf',
                    'bf'
                ),
            wf_bf_bf:
                castLabel(
                    'wf',
                    'bf',
                    'bf'
                ),
            bf_bf_bf:
                castLabel(
                    'bf',
                    'bf',
                    'bf'
                )
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
        .filter(
            Boolean
        )
        .join(
            ' - '
        );

}

module.exports = {
    canonicalCastOrder,
    canonicalizeCastCategories,
    castLabel,
    castSymbol,
    sceneTypes,
    sceneGroups,
    getSceneGroup,
    getSceneGroupKey,
    getSceneCategoryLabel,
    getSceneCategoryName
};
