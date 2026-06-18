const Canvas =
    require('canvas');

const {
    AttachmentBuilder
} = require(
    'discord.js'
);

const { registerFont } =
    require('canvas');

registerFont(

    './assets/fonts/BrittanySignature.ttf',

    {
        family:
            'Signature'
    }

);

async function generateMemberCard(
    interaction
) {

    const canvas =
        Canvas.createCanvas(
            512,
            512
        );

    const ctx =
        canvas.getContext(
            '2d'
        );

    const background =
        await Canvas.loadImage(
            './assets/member-card.png'
        );

    ctx.drawImage(
        background,
        0,
        0
    );

    const username =
        interaction.member.displayName;

    ctx.font =
    '52px Signature';

    ctx.textAlign =
        'center';

    ctx.fillStyle =
        '#ffffff';

    ctx.shadowColor =
        '#00e5ff';

    ctx.shadowBlur =
        18;

    ctx.fillText(

        username,

        256,

        345

    );

    return new AttachmentBuilder(

        canvas.toBuffer(),

        {
            name:
                'member-card.png'
        }

    );

}

module.exports = {
    generateMemberCard
};