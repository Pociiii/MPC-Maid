function pickOne(
    values,
    fallback = ''
) {

    if (
        !Array.isArray(
            values
        ) ||
        values.length === 0
    )
        return fallback;

    return values[
        Math.floor(
            Math.random() * values.length
        )
    ];

}

const interactionFlavor = {
    spank: [
        'That one definitely got noticed.',
        'The room looked over for a second.',
        'A little public trouble, exactly on brand.'
    ],
    kiss: [
        'Soft, shiny, and impossible to miss.',
        'The club caught the little spark.',
        'A sweet little moment crossed the room.'
    ],
    brofist: [
        'Solid club energy, no speech needed.',
        'A quick hit of brotherly hype.',
        'The kind of support that keeps the room moving.'
    ],
    hornyHelp: [
        'Help arrived before the heat faded.',
        'Someone stepped in and kept the mood alive.',
        'The club loves a helpful hand.'
    ]
};

const dailyFlavor = {
    quest: [
        'Another little mark on the Maid Feed.',
        'That progress did not slip by unnoticed.',
        'The club saw the effort.'
    ],
    set: [
        'A full daily set is done. The club noticed.',
        'That is the kind of consistency that keeps the place alive.',
        'Clean sweep for the day. Nice little flex.'
    ],
    weekly: [
        'A full week of showing up deserves a louder spotlight.',
        'Seven days in a row. That is real club stamina.',
        'That weekly streak has some heat behind it.'
    ]
};

const maidFeedFlavor = {
    achievement: [
        'Another name lit up the Maid Feed.',
        'A little progress just became official.',
        'That milestone did not slip by unnoticed.'
    ],
    gifApproval: [
        'Fresh material just joined the library.',
        'The GIF stash got a little stronger.',
        'New fuel for future commands just landed.'
    ],
    spankDilli: [
        'The casino corner just made some noise.',
        'Someone walked away with the prize.',
        'Spank Dilli paid out, and the feed noticed.'
    ]
};

const sceneFinalReview = {
    Awkward: [
        'The chemistry had sparks, even if the camera caught the nerves.',
        'A rough cut, but the club still loves a brave take.',
        'Not every scene is smooth. At least it gave people something to talk about.'
    ],
    Solid: [
        'Clean work, steady heat, good crowd response.',
        'A reliable release with enough heat to keep people watching.',
        'Nothing wasted, nothing overdone. Solid studio work.'
    ],
    Hot: [
        'The room stayed locked in from start to finish.',
        'That one had enough heat to make the feed pause.',
        'The chemistry carried this one hard.'
    ],
    Viral: [
        'This one is going to be replayed.',
        'The club will be talking about this release for a while.',
        'That was not just a scene. That was a headline.'
    ]
};

const cooldownFlavor = [
    'The club needs a minute.',
    'Give the room a little time to breathe.',
    'Let the last bit of attention settle first.'
];

module.exports = {
    cooldownFlavor,
    dailyFlavor,
    interactionFlavor,
    maidFeedFlavor,
    pickOne,
    sceneFinalReview
};
