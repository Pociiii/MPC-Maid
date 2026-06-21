const PREGNANCY = {
    BASE_CHANCE: 1,
    DURATION_DAYS: 30,
    GENDER_REVEAL_DAY: 7
};

const CARRIER_FERTILITY_STATES = {
    infertile: {
        label:
            'Infertile',
        chance:
            0,
        weight:
            25
    },
    low: {
        label:
            'Low',
        chance:
            2,
        weight:
            30
    },
    medium: {
        label:
            'Medium',
        chance:
            4,
        weight:
            25
    },
    high: {
        label:
            'High',
        chance:
            6,
        weight:
            15
    },
    peak: {
        label:
            'Peak',
        chance:
            9,
        weight:
            5
    }
};

const PARTNER_FERTILITY_STATES = {
    low: {
        label:
            'Low',
        chance:
            0
    },
    normal: {
        label:
            'Normal',
        chance:
            1
    },
    high: {
        label:
            'High',
        chance:
            2
    },
    hyper: {
        label:
            'Hyper',
        chance:
            3
    }
};

const DEFAULT_PARTNER_FERTILITY =
    'normal';

module.exports = {
    CARRIER_FERTILITY_STATES,
    DEFAULT_PARTNER_FERTILITY,
    PARTNER_FERTILITY_STATES,
    PREGNANCY
};
