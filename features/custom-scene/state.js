const {
    getSceneCategoryLabel
} = require('../../data/sceneSubmitGroups');

const maxParts =
    8;

const castLabels = {
    wm_wf: getSceneCategoryLabel('mf', 'wm_wf'),
    wm_bf: getSceneCategoryLabel('mf', 'wm_bf'),
    bm_wf: getSceneCategoryLabel('mf', 'bm_wf'),
    bm_bf: getSceneCategoryLabel('mf', 'bm_bf'),
    wf_wf: getSceneCategoryLabel('ff', 'wf_wf'),
    wf_bf: getSceneCategoryLabel('ff', 'wf_bf'),
    bf_bf: getSceneCategoryLabel('ff', 'bf_bf')
};

const phaseLabels = {
    foreplay: 'Foreplay',
    oral: 'Oral',
    sex: 'Sex',
    finale: 'Finale'
};

const phaseCodes = {
    foreplay: 'f',
    oral: 'o',
    sex: 's',
    finale: 'e'
};

const codePhases = {
    f: 'foreplay',
    o: 'oral',
    s: 'sex',
    e: 'finale'
};

const phaseValues =
    Object.keys(
        phaseLabels
    );

function encodeParts(
    parts
) {

    return parts
        .map(
            (part) =>
                phaseCodes[part]
        )
        .join(
            ''
        );

}

function decodeParts(
    value
) {

    if (
        !value
    )
        return [];

    return value
        .split(
            ''
        )
        .map(
            (code) =>
                codePhases[code]
        )
        .filter(
            Boolean
        );

}

function createCustomId(
    action,
    userId,
    cast,
    parts
) {

    return `customscene_${action}:${userId}:${cast}:${encodeParts(parts)}`;

}

module.exports = {
    castLabels,
    createCustomId,
    decodeParts,
    maxParts,
    phaseLabels,
    phaseValues
};
