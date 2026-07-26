const {
    CHANNELS,
    getRandomColor
} = require('../data/constants');

const {
    createEmbed
} = require('./embeds');

const {
    commandFooter
} = require('./version');

const flavorPools = {
    scene_request: [
        'A new production just became a Moment backstage.',
        'Someone just started talking business behind the velvet curtain.',
        'The studio Moments board is already warming up.',
        'A fresh idea is moving through the dressing room.',
        'The cameras are not rolling yet, but the room is curious.',
        'A new invite is making the backstage air warmer.'
    ],
    scene_start: [
        'The cameras are rolling and the room is already paying attention.',
        'A fresh recording just hit the studio floor.',
        'People around the room are already watching this one closely.',
        'The set lights are on, and the crowd leaned in fast.',
        'A new scene stepped out of planning and into motion.',
        'The studio found its rhythm, and the room noticed.'
    ],
    scene_final: [
        'A new release just wrapped, and the studio is buzzing.',
        'The final cut is out, and the talk started fast.',
        'Another production is in the books. The crowd has opinions.',
        'The last take landed, and the feed is already moving.',
        'The scene wrapped with enough spark to leave a trail.',
        'The cameras stopped, but the conversation did not.'
    ],
    relationship_created: [
        'Love is in the air at Midnight Pleasure.',
        'Two familiar faces just made things official.',
        'The room has a new soft spot tonight.',
        'A sweet link just found its place in the story.',
        'Two names just moved a little closer on the board.',
        'That bond has enough glow to earn a Moment.'
    ],
    breed_accepted: [
        'Two members slipped away for some private time.',
        'The private rooms were not so quiet today.',
        'A little closed-door chemistry just made the Moments board.',
        'A private spark turned into a shared note.',
        'Some invitations are quiet, but the afterglow still travels.',
        'A little private time added warmth to the day.'
    ],
    pregnancy_confirmed: [
        'A private chapter quietly became something bigger.',
        'A special new journey just joined the story.',
        'Something meaningful is growing behind the scenes.',
        'The Moments board caught a tender new chapter.',
        'A quiet kind of news found its way into the room.',
        'Some private magic is becoming part of the shared story.'
    ],
    pregnancy_reveal: [
        'The private countdown reached its first big reveal.',
        'The baby news just got a little more real.',
        'A sweet reveal made its way through the room.',
        'A tender update just found its spotlight.',
        'The journey opened a new little page today.',
        'A quiet wait turned into a softer kind of news.'
    ],
    birth: [
        'A long little journey reached its big moment.',
        'The room has a new birth story to smile about.',
        'Thirty days later, the private chapter became official.',
        'A tender story reached its first big hello.',
        'The waiting ended with a new name for the board.',
        'A private journey became a shared celebration.'
    ],
    party_drink: [
        'Someone just bought the room a little more courage.',
        'A fresh round made the night feel warmer.',
        'The bar got busy, and the room noticed who paid.',
        'A small toast just turned into a shared Moment.',
        'The night picked up a little sparkle from one generous round.',
        'Someone made sure nobody online was left empty-handed.'
    ],
    party_firework: [
        'Someone just made the ceiling remember their name.',
        'The room got brighter, louder, and impossible to ignore.',
        'A public flex just crossed the Moments board.',
        'Someone spent big just to light up the night.',
        'The neon got competition for a few seconds.',
        'That was not subtle, which was probably the point.'
    ],
    casino_jackpot: [
        'The casino lights just got a little brighter.',
        'Someone made the house blink first.',
        'A lucky hit just made noise across the room.',
        'The table had to respect that one.',
        'One bold pull turned into a loud little payday.',
        'The feed loves a win that arrives with style.'
    ],
    career_milestone: [
        'A career milestone just landed under the neon.',
        'Someone added another notch to their studio story.',
        'The records just got a little heavier.',
        'The studio board has another name to underline.',
        'That career path is starting to leave a brighter trail.',
        'A steady run just became official enough to post.'
    ],
    activity_scene_milestone: [
        'Another mark on the studio wall. Some careers do not stay quiet for long.',
        'That is not a one-off anymore. The room is starting to recognize the pattern.',
        'The cameras keep finding them, and the numbers are starting to agree.',
        'A busy run just became official enough for the board.',
        'Scene by scene, that reputation is becoming easier to spot.',
        'The studio count says this is more than a lucky streak.'
    ],
    activity_help_milestone: [
        'Some members do not just show up. They step in when the room gets hot.',
        'That helpful streak has become hard to miss.',
        'A good assist can change the whole scene, and the count is starting to prove it.',
        'The room noticed who keeps answering the call.',
        'That kind of support adds up faster than people expect.',
        'A steady helper just earned a louder note on the board.'
    ],
    activity_spank_milestone: [
        'That hand has been busy enough for the board to notice.',
        'Some reputations are built one sharp little moment at a time.',
        'The room keeps hearing the same name after the smack lands.',
        'A public habit just crossed into milestone territory.',
        'A playful pattern just became too loud to ignore.',
        'The count says that teasing hand has been working overtime.'
    ],
    activity_kiss_milestone: [
        'A little sparkle became a pattern.',
        'That is a lot of kisses for one record to ignore.',
        'Soft moves count too, especially when they keep happening.',
        'The room keeps catching that same sweet signal.',
        'A steady trail of sweetness just earned its own note.',
        'Some people leave glitter in the stats without even trying.'
    ],
    activity_brofist_milestone: [
        'Solid support has a way of adding up.',
        'That is a lot of quick hype from one familiar name.',
        'The room saw the energy, and now the count backs it up.',
        'A steady run of brofists just made the board.',
        'Shared hype became a habit, and the numbers noticed.',
        'That support streak is looking very official now.'
    ]
};

function pickMomentFlavor(
    type,
    fallback = 'The moment board has something new.'
) {

    const pool =
        flavorPools[type] ?? [];

    if (
        pool.length === 0
    )
        return fallback;

    return pool[
        Math.floor(
            Math.random() * pool.length
        )
    ];

}

function buildMomentEmbed(
    {
        authorIcon,
        authorName,
        color = getRandomColor(),
        command,
        fields = [],
        flavor,
        footer,
        image,
        thumbnail,
        timestamp = true,
        title,
        type
    }
) {

    const embed =
        createEmbed({
            color,
            authorName,
            authorIcon,
            thumbnail,
            image,
            title,
            description:
                flavor ?? pickMomentFlavor(
                    type
                ),
            footerText:
                footer ??
                (
                    command
                        ? commandFooter(
                            command
                        )
                        : undefined
                ),
            timestamp
        });

    const cleanFields =
        fields.filter(
            (field) =>
                field?.name &&
                field?.value !== undefined &&
                field?.value !== null &&
                String(
                    field.value
                ).length > 0
        );

    if (
        cleanFields.length > 0
    )
        embed.addFields(
            ...cleanFields
        );

    return embed;

}

async function getMomentsChannel(
    client,
    channelId = CHANNELS.MOMENTS
) {

    return client.channels.cache.get(
        channelId
    ) ??
        await client.channels.fetch(
            channelId
        ).catch(
            () => null
        );

}

async function postMoment(
    client,
    options
) {

    const channel =
        await getMomentsChannel(
            client,
            options.channelId
        );

    if (
        !channel?.isTextBased?.() &&
        !channel?.send
    )
        return null;

    const embed =
        buildMomentEmbed(
            options
        );

    return channel.send({
        content:
            options.content,
        embeds: [
            embed
        ]
    });

}

module.exports = {
    buildMomentEmbed,
    getMomentsChannel,
    pickMomentFlavor,
    postMoment
};
