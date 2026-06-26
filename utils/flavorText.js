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
        'A little public trouble, exactly on brand.',
        'A playful little snap, and the mood jumped.',
        'That kind of mischief never stays quiet for long.',
        'Someone just added a little sting to the shared energy.'
    ],
    kiss: [
        'Soft, shiny, and impossible to miss.',
        'A sweet spark crossed the room.',
        'A sweet little moment crossed the room.',
        'That kiss left a little glow behind.',
        'A gentle signal landed exactly where it should.',
        'A bit of sweetness slipped into the feed.'
    ],
    brofist: [
        'Solid group energy, no speech needed.',
        'A quick hit of brotherly hype.',
        'The kind of support that keeps the room moving.',
        'A clean little boost from one familiar face to another.',
        'Shared hype, quick and simple.',
        'That was the kind of backup people notice.'
    ],
    hornyHelp: [
        'Help arrived before the heat faded.',
        'Someone stepped in and kept the mood alive.',
        'A helpful hand kept the room smiling.',
        'Good timing can save a whole mood.',
        'One assist, one warmer room.',
        'The shared energy got a useful little push.'
    ]
};

const dailyFlavor = {
    quest: [
        'Another little mark on the Maid Feed.',
        'That progress did not slip by unnoticed.',
        'The room saw the effort.',
        'A small step, but the feed remembers those.',
        'One task down, one brighter little trace.',
        'Progress looks good when it keeps showing up.'
    ],
    set: [
        'A full daily set is done. The room noticed.',
        'That is the kind of consistency that keeps the place alive.',
        'Clean sweep for the day. Nice little flex.',
        'Three checks, one tidy finish.',
        'That daily board got handled with style.',
        'A complete set always deserves a little spotlight.'
    ],
    weekly: [
        'A full week of showing up deserves a louder spotlight.',
        'Seven days in a row. That is real staying power.',
        'That weekly streak has some heat behind it.',
        'A steady week like that starts to feel like a signature.',
        'The feed remembers who keeps coming back.',
        'Seven clean days, and the pattern is hard to miss.'
    ]
};

const maidFeedFlavor = {
    achievement: [
        'Another name lit up the Maid Feed.',
        'A little progress just became official.',
        'That milestone did not slip by unnoticed.',
        'A quiet grind just earned a louder mark.',
        'The feed caught another step forward.',
        'That one belongs on the progress board.'
    ],
    gifApproval: [
        'Fresh material just joined the library.',
        'The GIF stash got a little stronger.',
        'New fuel for future commands just landed.',
        'The shared library picked up another spark.',
        'That one is ready for future mischief.',
        'A fresh reaction just found its place.'
    ],
    spankDilli: [
        'The casino corner just made some noise.',
        'Someone walked away with the prize.',
        'Spank Dilli paid out, and the feed noticed.',
        'The table got loud for the right reason.',
        'A lucky swing just turned into a payout.',
        'The house blinked, and someone collected.'
    ]
};

const sceneFinalReview = {
    Awkward: [
        'The chemistry had sparks, even if the camera caught the nerves.',
        'A rough cut, but brave takes still have charm.',
        'Not every scene is smooth. At least it gave people something to talk about.',
        'The timing wobbled, but the effort stayed visible.',
        'A little messy, a little memorable, and still part of the story.',
        'The nerves showed, but so did the willingness to play.'
    ],
    Solid: [
        'Clean work, steady heat, good crowd response.',
        'A reliable release with enough heat to keep people watching.',
        'Nothing wasted, nothing overdone. Solid studio work.',
        'The pace held, the room stayed with it, and the finish landed.',
        'A steady scene with enough spark to leave a mark.',
        'Good chemistry, clean delivery, easy replay value.'
    ],
    Hot: [
        'The room stayed locked in from start to finish.',
        'That one had enough heat to make the feed pause.',
        'The chemistry carried this one hard.',
        'The camera found the right rhythm and never really lost it.',
        'A strong release with a crowd that clearly stayed awake.',
        'That scene knew exactly when to turn the temperature up.'
    ],
    Viral: [
        'This one is going to be replayed.',
        'People will be talking about this release for a while.',
        'That was not just a scene. That was a headline.',
        'The feed did not just notice. It stopped scrolling.',
        'That kind of chemistry travels fast.',
        'A scene like that does not stay quiet after the final cut.'
    ]
};

const cooldownFlavor = [
    'The room needs a minute.',
    'Give the room a little time to breathe.',
    'Let the last bit of attention settle first.',
    'Hold that thought while the mood resets.',
    'Let the previous spark fade before lighting another.',
    'A little patience keeps the next moment cleaner.'
];

module.exports = {
    cooldownFlavor,
    dailyFlavor,
    interactionFlavor,
    maidFeedFlavor,
    pickOne,
    sceneFinalReview
};
