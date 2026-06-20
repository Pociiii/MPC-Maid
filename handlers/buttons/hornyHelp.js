const fs =
    require('fs');

const path =
    require('path');

const {
    ActionRowBuilder,
    ButtonBuilder
} = require('discord.js');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    adpLogoPath,
    adpLogoAttachment
} = require('../../utils/adpLogo');

const {
    getRandomColor
} = require('../../data/constants');

const {
    getMemberCategory
} = require('../../utils/userCategory');

const sceneRoot =
    path.join(
        __dirname,
        '..',
        '..',
        'data',
        'scenes'
    );

function getSceneCategory(
    firstCategory,
    secondCategory
) {

    const categories =
        [
            firstCategory,
            secondCategory
        ];

    const maleCategory =
        categories.find(
            (category) =>
                category.endsWith(
                    'm'
                )
        );

    const femaleCategories =
        categories.filter(
            (category) =>
                category.endsWith(
                    'f'
                )
        );

    if (
        maleCategory &&
        femaleCategories.length === 1
    )
        return `${maleCategory}_${femaleCategories[0]}`;

    if (
        femaleCategories.length === 2
    ) {

        const uniqueCategories =
            [...new Set(
                femaleCategories
            )];

        return uniqueCategories.length === 1
            ? `${uniqueCategories[0]}_${uniqueCategories[0]}`
            : 'wf_bf';

    }

    return null;

}

function getRandomHelpScene(
    sceneCategory
) {

    const phases =
        [
            'oral',
            'sex'
        ];

    const candidates =
        phases.flatMap(
            (phase) => {

                const filePath =
                    path.join(
                        sceneRoot,
                        sceneCategory,
                        `${phase}.json`
                    );

                if (
                    !fs.existsSync(
                        filePath
                    )
                )
                    return [];

                const gifs =
                    JSON.parse(
                        fs.readFileSync(
                            filePath,
                            'utf8'
                        )
                    );

                return gifs.map(
                    (url, index) => ({

                        phase,
                        url,
                        index:
                            index + 1,
                        total:
                            gifs.length

                    })
                );

            }
        );

    if (
        candidates.length === 0
    )
        return null;

    return candidates[
        Math.floor(
            Math.random() * candidates.length
        )
    ];

}

module.exports = async (
    interaction
) => {

    const targetUserId =
        interaction.customId.split(
            ':'
        )[1];

    if (
        interaction.user.id === targetUserId
    ) {

        return interaction.reply({

            content:
                'You cannot help yourself with this button.',

            flags: 64

        });

    }

    let targetMember;

    try {

        targetMember =
            await interaction.guild.members.fetch(
                targetUserId
            );

    }
    catch {

        return interaction.reply({

            content:
                'I could not find the user who started this horny scene.',

            flags: 64

        });

    }

    let targetCategory;
    let helperCategory;

    try {

        targetCategory =
            getMemberCategory(
                targetMember
            );

        helperCategory =
            getMemberCategory(
                interaction.member
            );

    }
    catch (error) {

        return interaction.reply({

            content:
                `Missing role info: ${error.message}`,

            flags: 64

        });

    }

    const sceneCategory =
        getSceneCategory(
            targetCategory,
            helperCategory
        );

    if (
        !sceneCategory
    ) {

        return interaction.reply({

            content:
                'No matching help scene category exists for this role combination.',

            flags: 64

        });

    }

    const scene =
        getRandomHelpScene(
            sceneCategory
        );

    if (
        !scene
    ) {

        return interaction.reply({

            content:
                `No oral or sex GIFs were found for ${sceneCategory}.`,

            flags: 64

        });

    }

    const embed =
        createEmbed({

            color:
                getRandomColor(),

            authorName:
                interaction.member.displayName,

            authorIcon:
                adpLogoAttachment,

            thumbnail:
                interaction.user.displayAvatarURL(),

            title:
                'Help Arrived',

            description:
                `<@${interaction.user.id}> helps <@${targetUserId}>.`,

            image:
                scene.url,

            footerText:
                `${sceneCategory} / ${scene.phase} GIF #${scene.index}/${scene.total}`,

            timestamp:
                true

        });

    const disabledRow =
        new ActionRowBuilder()
            .addComponents(

                ButtonBuilder
                    .from(
                        interaction.message
                            .components[0]
                            .components[0]
                    )
                    .setDisabled(true)

            );

    await interaction.deferUpdate();

    await interaction.message.edit({

        components: [
            disabledRow
        ]

    });

    await interaction.followUp({

        embeds: [embed],

        files: [adpLogoPath]

    });

};
