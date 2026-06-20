const Canvas =
    require('canvas');

const {
    AttachmentBuilder
} = require(
    'discord.js'
);

const { registerFont } =
    require('canvas');

const path =
    require('path');

const ROLES =
    require('../data/roles.json');

registerFont(

    './assets/fonts/BrittanySignature.ttf',

    {
        family:
            'Signature'
    }

);

const cardAssets = {
    member:
        'member-card.png',
    crew:
        'mpcCrew-card.png',
    stiletto:
        'stilettoGang-card.png',
    tailored:
        'tailoredFew-card.png'
};

function getCardAsset(
    member
) {

    if (
        member.roles.cache.has(
            ROLES.MPC_CREW
        )
    ) {

        return cardAssets.crew;

    }

    if (
        member.roles.cache.has(
            ROLES.STILETTO_GANG
        )
    ) {

        return cardAssets.stiletto;

    }

    if (
        member.roles.cache.has(
            ROLES.TAILORED_FEW
        )
    ) {

        return cardAssets.tailored;

    }

    return cardAssets.member;

}

function drawFittedName(
    ctx,
    username,
    x,
    y,
    maxWidth
) {

    let fontSize =
        52;

    do {

        ctx.font =
            `${fontSize}px Signature`;

        fontSize -=
            2;

    } while (
        ctx.measureText(
            username
        ).width > maxWidth &&
        fontSize > 30
    );

    ctx.fillText(
        username,
        x,
        y
    );

}

async function drawAvatar(
    ctx,
    interaction,
    x,
    y,
    size
) {

    const avatarUrl =
        interaction.user.displayAvatarURL({
            extension:
                'png',
            size:
                256
        });

    const response =
        await fetch(
            avatarUrl
        );

    const avatarBuffer =
        Buffer.from(
            await response.arrayBuffer()
        );

    const avatar =
        await Canvas.loadImage(
            avatarBuffer
        );

    ctx.save();
    ctx.beginPath();
    ctx.arc(
        x + size / 2,
        y + size / 2,
        size / 2,
        0,
        Math.PI * 2
    );
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
        avatar,
        x,
        y,
        size,
        size
    );
    ctx.restore();

    ctx.lineWidth =
        5;

    ctx.strokeStyle =
        '#ffffff';

    ctx.shadowColor =
        '#00e5ff';

    ctx.shadowBlur =
        10;

    ctx.beginPath();
    ctx.arc(
        x + size / 2,
        y + size / 2,
        size / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.stroke();
    ctx.shadowBlur =
        0;

}

async function generateMemberCard(
    interaction
) {

    const cardAsset =
        getCardAsset(
            interaction.member
        );

    const background =
        await Canvas.loadImage(
            path.join(
                __dirname,
                '..',
                'assets',
                cardAsset
            )
        );

    const canvas =
        Canvas.createCanvas(
            background.width,
            background.height
        );

    const ctx =
        canvas.getContext(
            '2d'
        );

    ctx.drawImage(
        background,
        0,
        0
    );

    const username =
        interaction.member.displayName;

    ctx.textAlign =
        'center';

    ctx.fillStyle =
        '#ffffff';

    ctx.shadowColor =
        '#00e5ff';

    ctx.shadowBlur =
        18;

    drawFittedName(
        ctx,
        username,
        canvas.width / 2,
        345,
        390
    );

    try {

        await drawAvatar(
            ctx,
            interaction,
            360,
            354,
            110
        );

    }
    catch {

        // Keep generating the card even if Discord's avatar CDN is unavailable.

    }

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
