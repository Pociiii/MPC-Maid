const handleSpank =
    require('./buttons/spank');

const handleAddGifCategory =
    require('./menus/addgifCategory');

const handleBlowKiss =
    require('./buttons/blowkiss');

const handleRelationshipAccept =
    require('./buttons/relationshipAccept');

const handleRelationshipDecline =
    require('./buttons/relationshipDecline');

module.exports = async (
    interaction
) => {

    if (interaction.isButton()) {

        const action =
            interaction.customId
                .split(':')[0];

        switch (action) {

            case 'blowkiss':
                await handleBlowKiss(
                    interaction
                );
                return true;

            case 'spank':
                await handleSpank(
                    interaction
                );
                return true;

            case 'relationship_accept':
                await handleRelationshipAccept(
                    interaction
                );
                return true;

            case 'relationship_decline':
                await handleRelationshipDecline(
                    interaction
                );
                return true;

        }

    }

    if (
        interaction.isStringSelectMenu()
    ) {

        switch (
            interaction.customId
        ) {

            case 'addgif_category':
                await handleAddGifCategory(
                    interaction
                );
                return true;

        }

    }

    return false;

};