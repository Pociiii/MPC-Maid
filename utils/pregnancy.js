const ROLES =
    require('../data/roles.json');

const {
    PREGNANCY
} = require('../data/pregnancyConfig');

function hasRole(
    member,
    roleId
) {

    return member?.roles?.cache?.has(
        roleId
    ) ?? false;

}

function isCarrierEligible(
    member
) {

    return hasRole(
        member,
        ROLES.FEMALE
    );

}

function isImpregnatingEligible(
    member
) {

    return hasRole(
        member,
        ROLES.MALE
    ) ||
        hasRole(
            member,
            ROLES.FEMALE
        );

}

function getBreedingRoles(
    requester,
    target,
    carrierId = null
) {

    const requesterCanCarry =
        isCarrierEligible(
            requester
        );

    const targetCanCarry =
        isCarrierEligible(
            target
        );

    const requesterCanImpregnate =
        isImpregnatingEligible(
            requester
        );

    const targetCanImpregnate =
        isImpregnatingEligible(
            target
        );

    const requesterId =
        requester?.id;

    const targetId =
        target?.id;

    if (
        carrierId
    ) {

        if (
            carrierId !== requesterId &&
            carrierId !== targetId
        )
            return {
                valid:
                    false,
                reason:
                    'The chosen carrier must be one of the two partners.'
            };

        const carrier =
            carrierId === requesterId
                ? requester
                : target;

        const partner =
            carrierId === requesterId
                ? target
                : requester;

        if (
            !isCarrierEligible(
                carrier
            ) ||
            !isImpregnatingEligible(
                partner
            )
        )
            return {
                valid:
                    false,
                reason:
                    'That carrier/partner pairing is not valid.'
            };

        return {
            carrierId:
                carrier.id,
            partnerId:
                partner.id,
            valid:
                true
        };

    }

    if (
        requesterCanCarry &&
        targetCanCarry
    )
        return {
            needsCarrierChoice:
                true,
            valid:
                true
        };

    if (
        requesterCanCarry &&
        targetCanImpregnate
    )
        return {
            carrierId:
                requesterId,
            partnerId:
                targetId,
            valid:
                true
        };

    if (
        targetCanCarry &&
        requesterCanImpregnate
    )
        return {
            carrierId:
                targetId,
            partnerId:
                requesterId,
            valid:
                true
        };

    return {
        valid:
            false,
        reason:
            'One partner must be able to carry, and the other must be able to impregnate.'
    };

}

function generateDailyFertility(
    random = Math.random
) {

    const range =
        PREGNANCY.MAX_DAILY_FERTILITY -
        PREGNANCY.MIN_DAILY_FERTILITY +
        1;

    return Math.floor(
        random() * range
    ) + PREGNANCY.MIN_DAILY_FERTILITY;

}

function calculatePregnancyChance(
    carrierDailyFertility,
    partnerDailyFertility
) {

    return Number(
        carrierDailyFertility
    ) + Number(
        partnerDailyFertility
    );

}

function getUniquePartnerCandidates(
    partners
) {

    const uniquePartners =
        new Map();

    for (
        const partner of partners
    ) {

        if (
            !partner?.userId
        )
            continue;

        const existing =
            uniquePartners.get(
                partner.userId
            );

        if (
            existing
        )
            continue;

        uniquePartners.set(
            partner.userId,
            {
                ...partner
            }
        );

    }

    return [
        ...uniquePartners.values()
    ];

}

function pickRandomPartner(
    partners,
    random = Math.random
) {

    if (
        partners.length === 0
    )
        return null;

    return partners[
        Math.floor(
            random() * partners.length
        )
    ];

}

module.exports = {
    calculatePregnancyChance,
    generateDailyFertility,
    getUniquePartnerCandidates,
    getBreedingRoles,
    isCarrierEligible,
    isImpregnatingEligible,
    pickRandomPartner
};
