const {
    getRandomColor
} = require('../../data/constants');

const {
    createEmbed,
    createTargetUserEmbed
} = require('../../utils/embeds');

const {
    CARRIER_FERTILITY_STATES,
    PARTNER_FERTILITY_STATES,
    PREGNANCY
} = require('../../data/pregnancyConfig');

const {
    getNextPregnancyCheckTimestamp,
    getPregnancyDay
} = require('../../database/pregnancy');

const DAY_MS =
    24 * 60 * 60 * 1000;

function formatFertility(
    key,
    states
) {

    const state =
        states[key];

    if (
        !state
    )
        return 'Unknown';

    return `${state.label} (+${state.chance}%)`;

}

function formatTimestamp(
    timestamp
) {

    return `<t:${timestamp}:F> (<t:${timestamp}:R>)`;

}

function getRevealTimestamp(
    pregnancy
) {

    const startedAt =
        new Date(
            pregnancy.started_at
        );

    return Math.floor(
        (startedAt.getTime() + (PREGNANCY.GENDER_REVEAL_DAY - 1) * DAY_MS) / 1000
    );

}

function getDueTimestamp(
    pregnancy
) {

    return Math.floor(
        new Date(
            pregnancy.due_at
        ).getTime() / 1000
    );

}

function buildBreedRequestEmbed(
    requester,
    carrierId,
    partnerId
) {

    return createEmbed({
        color:
            getRandomColor(),
        authorName:
            requester.displayName,
        authorIcon:
            requester.displayAvatarURL(),
        title:
            'Breed Request',
        description:
`<@${requester.id}> wants to breed with you.

Carrier: <@${carrierId}>
Partner: <@${partnerId}>
Next pregnancy check: ${formatTimestamp(
    getNextPregnancyCheckTimestamp()
)}`,
        thumbnail:
            requester.displayAvatarURL(),
        footerText:
            '/breed',
        timestamp:
            true
    });

}

function buildPregnancyStatusEmbed(
    target,
    status,
    dailyFertility
) {

    const embed =
        createTargetUserEmbed({
            color:
                getRandomColor(),
            command:
                '/pregnancy',
            target,
            title:
                'Pregnancy'
        });

    const active =
        status.activePregnancy;

    embed.addFields(
        {
            name:
                '\uD83C\uDF38 Fertility Today',
            value:
                dailyFertility
                    ? formatFertility(
                        dailyFertility,
                        CARRIER_FERTILITY_STATES
                    )
                    : 'Not a carrier.',
            inline:
                true
        },
        {
            name:
                '\uD83D\uDD25 Breeding Fertility',
            value:
                formatFertility(
                    status.profile.partner_fertility,
                    PARTNER_FERTILITY_STATES
                ),
            inline:
                true
        },
        {
            name:
                '\uD83D\uDC76 Children',
            value:
                String(
                    status.children
                ),
            inline:
                true
        },
        {
            name:
                '\u23F3 Next Check',
            value:
                formatTimestamp(
                    getNextPregnancyCheckTimestamp()
                ),
            inline:
                false
        }
    );

    if (
        active
    ) {

        const day =
            getPregnancyDay(
                active
            );

        embed.addFields(
            {
                name:
                    '\uD83E\uDD30 Current Pregnancy',
                value:
`Day **${day}/${PREGNANCY.DURATION_DAYS}**
Father: <@${active.father_id}>
Gender: ${
    active.gender_revealed
        ? `**${active.baby_gender}**`
        : `Hidden until Day ${PREGNANCY.GENDER_REVEAL_DAY} (${formatTimestamp(
            getRevealTimestamp(
                active
            )
        )})`
}
Due: ${formatTimestamp(
    getDueTimestamp(
        active
    )
)}`,
                inline:
                    false
            }
        );

    }
    else {

        embed.addFields(
            {
                name:
                    '\uD83E\uDD30 Current Pregnancy',
                value:
                    'Not pregnant.',
                inline:
                    false
            }
        );

    }

    return embed;

}

function buildPregnancyConfirmedEmbed(
    pregnancy,
    carrier
) {

    return createTargetUserEmbed({
        color:
            getRandomColor(),
        command:
            '/pregnancy',
        description:
`<@${pregnancy.carrier_id}> is pregnant.

Father: <@${pregnancy.father_id}>
Gender reveal: ${formatTimestamp(
    getRevealTimestamp(
        pregnancy
    )
)}
Due: ${formatTimestamp(
    getDueTimestamp(
        pregnancy
    )
)}`,
        target:
            carrier,
        title:
            'Pregnancy Confirmed'
    });

}

function buildGenderRevealEmbed(
    pregnancy,
    carrier
) {

    return createTargetUserEmbed({
        color:
            getRandomColor(),
        command:
            '/pregnancy',
        description:
`<@${pregnancy.carrier_id}> reached Day ${PREGNANCY.GENDER_REVEAL_DAY}.

The baby is a **${pregnancy.baby_gender}**.
Due: ${formatTimestamp(
    getDueTimestamp(
        pregnancy
    )
)}`,
        target:
            carrier,
        title:
            'Gender Reveal'
    });

}

function buildBirthEmbed(
    pregnancy,
    carrier
) {

    return createTargetUserEmbed({
        color:
            getRandomColor(),
        command:
            '/pregnancy',
        description:
`<@${pregnancy.carrier_id}> gave birth.

Father: <@${pregnancy.father_id}>
Baby: **${pregnancy.baby_gender}**`,
        target:
            carrier,
        title:
            'Birth Announcement'
    });

}

module.exports = {
    buildBirthEmbed,
    buildBreedRequestEmbed,
    buildGenderRevealEmbed,
    buildPregnancyConfirmedEmbed,
    buildPregnancyStatusEmbed
};
