const {
    getRandomColor
} = require('../../data/constants');

const {
    createEmbed,
    createTargetUserEmbed,
    getDisplayAvatar,
    getDisplayName
} = require('../../utils/embeds');

const {
    commandFooter
} = require('../../utils/version');

const {
    pickMomentFlavor
} = require('../../utils/moments');

const {
    PREGNANCY
} = require('../../data/pregnancyConfig');

const {
    getNextPregnancyCheckTimestamp,
    getPregnancyDay
} = require('../../database/pregnancy');

const DAY_MS =
    24 * 60 * 60 * 1000;

function formatFertility(
    value
) {

    return `**${Number(
        value
    )}%**`;

}

function formatTimestamp(
    timestamp
) {

    return `<t:${timestamp}:F> (<t:${timestamp}:R>)`;

}

function formatDateTimestamp(
    value
) {

    if (
        !value
    )
        return 'Never';

    return formatTimestamp(
        Math.floor(
            new Date(
                value
            ).getTime() / 1000
        )
    );

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

function getCarrierStyle(
    carrier
) {

    if (
        !carrier
    )
        return {};

    return {
        authorName:
            getDisplayName(
                carrier
            ),
        thumbnail:
            getDisplayAvatar(
                carrier
            )
    };

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
                '\uD83C\uDF38 Daily Fertility',
            value:
                formatFertility(
                    dailyFertility
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
                '\uD83E\uDD30 Pregnancies',
            value:
                String(
                    status.profile.pregnancy_count ?? 0
                ),
            inline:
                true
        },
        {
            name:
                '\uD83D\uDD25 Successful Breeds',
            value:
                String(
                    status.profile.pregnancy_partner_count ?? 0
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
        },
        {
            name:
                '\uD83D\uDCC5 Last Pregnancy',
            value:
                formatDateTimestamp(
                    status.profile.last_pregnancy_at
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
`- Day: **${day}/${PREGNANCY.DURATION_DAYS}**
- Father: <@${active.father_id}>
- Gender: ${
    active.gender_revealed
        ? `**${active.baby_gender}**`
        : `Hidden until Day ${PREGNANCY.GENDER_REVEAL_DAY} (${formatTimestamp(
            getRevealTimestamp(
                active
            )
        )})`
}
- Due: ${formatTimestamp(
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

    const embed =
        createEmbed({
            ...getCarrierStyle(
                carrier
            ),
            color:
                getRandomColor(),
            description:
                pickMomentFlavor(
                    'pregnancy_confirmed'
                ),
            title:
                'Pregnancy Moment',
            footerText:
                commandFooter(
                    '/pregnancy'
                ),
            timestamp:
                true
        });

    embed.addFields(
        {
            name:
                '\uD83E\uDD30 Stage',
            value:
                'Confirmed',
            inline:
                true
        },
        {
            name:
                '\uD83D\uDD0E Reveal',
            value:
                formatTimestamp(
                    getRevealTimestamp(
                        pregnancy
                    )
                ),
            inline:
                true
        }
    );

    return embed;

}

function buildGenderRevealEmbed(
    pregnancy,
    carrier
) {

    const embed =
        createEmbed({
            ...getCarrierStyle(
                carrier
            ),
            color:
                getRandomColor(),
            description:
                pickMomentFlavor(
                    'pregnancy_reveal'
                ),
            title:
                'Gender Reveal',
            footerText:
                commandFooter(
                    '/pregnancy'
                ),
            timestamp:
                true
        });

    embed.addFields(
        {
            name:
                '\uD83C\uDF89 Stage',
            value:
                'Reveal',
            inline:
                true
        },
        {
            name:
                '\uD83D\uDCC5 Day',
            value:
                `${PREGNANCY.GENDER_REVEAL_DAY}/${PREGNANCY.DURATION_DAYS}`,
            inline:
                true
        },
        {
            name:
                '\uD83D\uDC76 Gender',
            value:
                pregnancy.baby_gender,
            inline:
                true
        }
    );

    return embed;

}

function buildBirthEmbed(
    pregnancy,
    carrier
) {

    const embed =
        createEmbed({
            ...getCarrierStyle(
                carrier
            ),
            color:
                getRandomColor(),
            description:
                pickMomentFlavor(
                    'birth'
                ),
            title:
                'Birth Announcement',
            footerText:
                commandFooter(
                    '/pregnancy'
                ),
            timestamp:
                true
        });

    embed.addFields(
        {
            name:
                '\uD83D\uDC76 Stage',
            value:
                'Birth',
            inline:
                true
        },
        {
            name:
                '\uD83D\uDC76 Gender',
            value:
                pregnancy.baby_gender,
            inline:
                true
        },
        {
            name:
                '\uD83D\uDCC5 Journey',
            value:
                `${PREGNANCY.DURATION_DAYS} days`,
            inline:
                true
        }
    );

    return embed;

}

module.exports = {
    buildBirthEmbed,
    buildBreedRequestEmbed,
    buildGenderRevealEmbed,
    buildPregnancyConfirmedEmbed,
    buildPregnancyStatusEmbed
};
