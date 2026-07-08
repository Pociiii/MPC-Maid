const claimedButtons =
    new Set();

function getButtonKey(
    interaction
) {

    return `${interaction.message?.id ?? 'unknown'}:${interaction.customId}`;

}

function claimButton(
    interaction
) {

    const key =
        getButtonKey(
            interaction
        );

    if (
        claimedButtons.has(
            key
        )
    )
        return false;

    claimedButtons.add(
        key
    );

    return true;

}

async function replyButtonAlreadyUsed(
    interaction
) {

    const payload = {
        content:
            'That button was already used.',
        flags:
            64
    };

    if (
        interaction.replied ||
        interaction.deferred
    )
        return interaction.followUp(
            payload
        );

    return interaction.reply(
        payload
    );

}

module.exports = {
    claimButton,
    replyButtonAlreadyUsed
};
