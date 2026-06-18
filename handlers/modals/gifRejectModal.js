module.exports = {


async execute(
    interaction
) {

    const [

        ,
        category,
        submitterId

    ] =
        interaction.customId.split(
            ':'
        );

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
