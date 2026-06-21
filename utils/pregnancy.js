const ROLES =
    require('../data/roles.json');

const {
    CARRIER_FERTILITY_STATES,
    DEFAULT_PARTNER_FERTILITY,
    PARTNER_FERTILITY_STATES,
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

function rollCarrierFertility(
    random = Math.random
) {

    const entries =
        Object.entries(
            CARRIER_FERTILITY_STATES
        );

    const totalWeight =
        entries.reduce(
            (total, [, state]) =>
                total + state.weight,
            0
        );

    let roll =
        random() * totalWeight;

    for (
        const [key, state] of entries
    ) {

        roll -= state.weight;

        if (
            roll <= 0
        )
            return key;

    }

    return entries[
        entries.length - 1
    ][0];

}

function getCarrierFertility(
    key
) {

    return CARRIER_FERTILITY_STATES[key] ??
        CARRIER_FERTILITY_STATES.low;

}

function getPartnerFertility(
    key = DEFAULT_PARTNER_FERTILITY
) {

    return PARTNER_FERTILITY_STATES[key] ??
        PARTNER_FERTILITY_STATES[DEFAULT_PARTNER_FERTILITY];

}

function calculatePregnancyChance(
    carrierFertilityKey,
    partnerFertilityKey = DEFAULT_PARTNER_FERTILITY
) {

    return PREGNANCY.BASE_CHANCE +
        getCarrierFertility(
            carrierFertilityKey
        ).chance +
        getPartnerFertility(
            partnerFertilityKey
        ).chance;

}

function getBestPartnerCandidates(
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

        const fertilityKey =
            partner.fertilityKey ??
            DEFAULT_PARTNER_FERTILITY;

        const fertilityChance =
            getPartnerFertility(
                fertilityKey
            ).chance;

        const existing =
            uniquePartners.get(
                partner.userId
            );

        if (
            existing &&
            existing.fertilityChance >= fertilityChance
        )
            continue;

        uniquePartners.set(
            partner.userId,
            {
                ...partner,
                fertilityKey,
                fertilityChance
            }
        );

    }

    const values =
        [
            ...uniquePartners.values()
        ];

    if (
        values.length === 0
    )
        return [];

    const bestChance =
        Math.max(
            ...values.map(
                (partner) =>
                    partner.fertilityChance
            )
        );

    return values.filter(
        (partner) =>
            partner.fertilityChance === bestChance
    );

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
    getBestPartnerCandidates,
    getBreedingRoles,
    getCarrierFertility,
    getPartnerFertility,
    isCarrierEligible,
    isImpregnatingEligible,
    pickRandomPartner,
    rollCarrierFertility
};
