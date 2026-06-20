module.exports = {


async execute(
    interaction
) {

    const parts =
        interaction.customId.split(
            ':'
        );

    const category =
        parts.length >= 4
            ? `${parts[1]}:${parts[2]}`
            : parts[1];

    const submitterId =
        parts[parts.length - 1];

    const reason =
        interaction.fields.getTextInputValue(
            'reason'
        );

    let dmSent = true;

    try {

        const user =
            await interaction.client.users.fetch(
                submitterId
            );

        await user.send(


`❌ Your GIF submission was rejected.

📁 Category: ${category}

📝 Reason: ${reason}

You can submit another GIF at any time.`


        );

    } catch {

        dmSent = false;

    }

    await interaction.update({

        content:


`❌ Rejected by ${interaction.user}

📝 Reason: ${reason}

📨 DM: ${
dmSent
? 'Sent'
: 'Failed (DMs closed)'
}`,


        embeds:
            interaction.message.embeds,

        components: []

    });

}


};
