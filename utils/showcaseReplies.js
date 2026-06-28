const {
    CHANNELS
} = require('../data/constants');

async function fetchShowcaseReplyThread(
    client
) {

    const thread =
        client.channels.cache.get(
            CHANNELS.SHOWCASE_REPLY_THREAD
        ) ??
        await client.channels.fetch(
            CHANNELS.SHOWCASE_REPLY_THREAD
        ).catch(
            () => null
        );

    if (
        !thread?.send
    )
        return null;

    if (
        thread.archived &&
        thread.setArchived
    )
        await thread.setArchived(
            false
        ).catch(
            () => null
        );

    return thread;

}

async function postShowcaseButtonReply(
    interaction,
    targetUserId,
    payload
) {

    const thread =
        await fetchShowcaseReplyThread(
            interaction.client
        );

    if (
        !thread
    ) {

        await interaction.followUp({
            content:
                `Could not post in the showcase reply thread <#${CHANNELS.SHOWCASE_REPLY_THREAD}>.`,
            flags:
                64
        }).catch(
            () => null
        );

        return null;

    }

    return thread.send({
        ...payload,
        content:
            payload.content ??
            `<@${targetUserId}>`,
        allowedMentions:
            payload.allowedMentions ?? {
                users:
                    [
                        targetUserId
                    ]
            }
    }).catch(
        async () => {

            await interaction.followUp({
                content:
                    `Could not post in the showcase reply thread <#${CHANNELS.SHOWCASE_REPLY_THREAD}>.`,
                flags:
                    64
            }).catch(
                () => null
            );

            return null;

        }
    );

}

module.exports = {
    fetchShowcaseReplyThread,
    postShowcaseButtonReply
};
