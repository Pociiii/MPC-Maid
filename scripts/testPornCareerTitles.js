#!/usr/bin/env node

const assert =
    require('node:assert/strict');

const {
    getPornCareerTitle
} = require('../utils/pornCareerTitles');

function buildUser(
    performance,
    stamina,
    fame
) {

    return {
        performance,
        stamina,
        fame
    };

}

assert.equal(
    getPornCareerTitle(
        buildUser(
            10,
            9,
            9
        )
    ),
    'Gentleman of Midnight',
    'Balanced titles must not advance until all three stats reach the tier threshold.'
);

assert.equal(
    getPornCareerTitle(
        buildUser(
            10,
            10,
            10
        )
    ),
    'Club Veteran',
    'Balanced titles should advance when all three stats reach the tier threshold.'
);

assert.equal(
    getPornCareerTitle(
        buildUser(
            10,
            7,
            9
        )
    ),
    'Velvet Superstar',
    'Combo titles must not advance until both combo stats reach the tier threshold.'
);

assert.equal(
    getPornCareerTitle(
        buildUser(
            10,
            8,
            10
        )
    ),
    'Main Attraction',
    'Combo titles should advance when both combo stats reach the tier threshold.'
);

assert.equal(
    getPornCareerTitle(
        buildUser(
            10,
            5,
            4
        )
    ),
    'Smooth Operator',
    'Single-stat titles should continue to use the highest stat tier.'
);

console.log(
    'Porn career title threshold tests passed.'
);
