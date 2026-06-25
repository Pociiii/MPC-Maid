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
        'A new production is being whispered about backstage.',
        'Someone just started talking business behind the velvet curtain.',
        'The studio gossip line is already warming up.'
    ],
    scene_start: [
        'The cameras are rolling and the room is already paying attention.',
        'A fresh recording just hit the studio floor.',
        'People around the club are already watching this one closely.'
    ],
    scene_final: [
        'A new release just wrapped, and the studio is buzzing.',
        'The final cut is out, and the whispers started fast.',
        'Another production is in the books. The crowd has opinions.'
    ],
    relationship_created: [
        'Love is in the air at Midnight Pleasure.',
        'Two familiar faces just made things official.',
        'The club rumor mill has a new soft spot tonight.'
    ],
    relationship_broken: [
        'Not every link survives the neon lights.',
        'The club rumor mill caught a quiet goodbye.',
        'A familiar bond just changed shape.'
    ],
    breed_accepted: [
        'Two members slipped away for some private time.',
        'The private rooms were not so quiet today.',
        'A little closed-door chemistry just made the rumor board.'
    ],
    pregnancy_confirmed: [
        'A private chapter quietly became something bigger.',
        'The club is whispering about a special new journey.',
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
    ]
};

function pickFlavor(
    type,
    fallback = 'The rumor board has something new.'
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

function buildRumorEmbed(
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
                flavor ?? pickFlavor(
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

async function getRumorsChannel(
    client
) {

    return client.channels.cache.get(
        CHANNELS.RUMORS
    ) ??
        await client.channels.fetch(
            CHANNELS.RUMORS
        ).catch(
            () => null
        );

}

async function postRumor(
    client,
    options
) {

    const channel =
        await getRumorsChannel(
            client
        );

    if (
        !channel?.isTextBased?.() &&
        !channel?.send
    )
        return null;

    const embed =
        buildRumorEmbed(
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
    buildRumorEmbed,
    pickFlavor,
    postRumor
};
