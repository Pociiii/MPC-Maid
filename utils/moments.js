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
        'A new production just became a club moment backstage.',
        'Someone just started talking business behind the velvet curtain.',
        'The studio moment board is already warming up.'
    ],
    scene_start: [
        'The cameras are rolling and the room is already paying attention.',
        'A fresh recording just hit the studio floor.',
        'People around the club are already watching this one closely.'
    ],
    scene_final: [
        'A new release just wrapped, and the studio is buzzing.',
        'The final cut is out, and the talk started fast.',
        'Another production is in the books. The crowd has opinions.'
    ],
    relationship_created: [
        'Love is in the air at Midnight Pleasure.',
        'Two familiar faces just made things official.',
        'The club chatter has a new soft spot tonight.'
    ],
    relationship_broken: [
        'Not every link survives the neon lights.',
        'The club chatter caught a quiet goodbye.',
        'A familiar bond just changed shape.'
    ],
    breed_accepted: [
        'Two members slipped away for some private time.',
        'The private rooms were not so quiet today.',
        'A little closed-door chemistry just made the moment board.'
    ],
    pregnancy_confirmed: [
        'A private chapter quietly became something bigger.',
        'The club has a special new journey to talk about.',
        'Something meaningful is growing behind the scenes.'
    ],
    pregnancy_reveal: [
        'The private countdown reached its first big reveal.',
        'The baby news just got a little more real.',
        'A sweet reveal made its way through the club.'
    ],
    birth: [
        'A long little journey reached its big moment.',
        'The club has a new birth story to smile about.',
        'Thirty days later, the private chapter became official.'
    ],
    casino_jackpot: [
        'The casino lights just got a little brighter.',
        'Someone made the house blink first.',
        'A lucky hit just made noise across the club.'
    ],
    career_milestone: [
        'A career milestone just landed under the neon.',
        'Someone added another notch to their studio story.',
        'The club records just got a little heavier.'
    ],
    activity_scene_milestone: [
        'Another mark on the studio wall. Some careers do not stay quiet for long.',
        'That is not a one-off anymore. The club is starting to recognize the pattern.',
        'The cameras keep finding them, and the numbers are starting to agree.',
        'A busy run just became official enough for the board.'
    ],
    activity_help_milestone: [
        'Some members do not just show up. They step in when the room gets hot.',
        'That helpful streak has become hard to miss.',
        'A good assist can change the whole scene, and the count is starting to prove it.',
        'The club noticed who keeps answering the call.'
    ],
    activity_spank_milestone: [
        'That hand has been busy enough for the board to notice.',
        'Some reputations are built one sharp little moment at a time.',
        'The room keeps hearing the same name after the smack lands.',
        'A public habit just crossed into milestone territory.'
    ],
    activity_kiss_milestone: [
        'A little sparkle became a pattern.',
        'That is a lot of kisses for one club record to ignore.',
        'Soft moves count too, especially when they keep happening.',
        'The room keeps catching that same sweet signal.'
    ],
    activity_brofist_milestone: [
        'Solid support has a way of adding up.',
        'That is a lot of quick hype from one familiar name.',
        'The club saw the energy, and now the count backs it up.',
        'A steady run of brofists just made the board.'
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
    client
) {

    return client.channels.cache.get(
        CHANNELS.MOMENTS
    ) ??
        await client.channels.fetch(
            CHANNELS.MOMENTS
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
            client
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
