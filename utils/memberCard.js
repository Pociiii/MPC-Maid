const Canvas =
    require('canvas');

const {
    AttachmentBuilder
} = require(
    'discord.js'
);

const path =
    require('path');

const ROLES =
    require('../data/roles.json');

const cardAssets = {
    member:
        'member-card.png',
    crew:
        'mpcCrew-card.png',
    stiletto:
        'stilettoGang-card.png',
    tailored:
        'tailoredFew-card.png',
    midnight:
        'midnightCircle-card.png'
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

    if (
        member.roles.cache.has(
            ROLES.MIDNIGHT_CIRCLE
        )
    ) {

        return cardAssets.midnight;

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
        136;

    do {

        ctx.font =
            `italic ${fontSize}px "Segoe Script", "Brush Script MT", cursive`;

        fontSize -=
            2;

    } while (
        ctx.measureText(
            username
        ).width > maxWidth &&
        fontSize > 58
    );

    ctx.lineJoin =
        'round';

    ctx.lineWidth =
        Math.max(
            5,
            Math.floor(
                fontSize / 12
            )
        );

    ctx.shadowColor =
        '#00f7ff';

    ctx.shadowBlur =
        18;

    ctx.strokeStyle =
        'rgba(12, 0, 25, 0.82)';

    ctx.strokeText(
        username,
        x,
        y
    );

    ctx.shadowColor =
        '#ff2ec4';

    ctx.shadowBlur =
        28;

    ctx.fillStyle =
        '#ffffff';

    ctx.fillText(
        username,
        x,
        y
    );

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

    drawFittedName(
        ctx,
        username,
        canvas.width / 2,
        1110,
        880
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
