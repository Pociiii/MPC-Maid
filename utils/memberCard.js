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
