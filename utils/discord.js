function getTargetUser(interaction) {

    return (
        interaction.options.getUser('user')
        || interaction.user
    );
}

module.exports = {
    getTargetUser
};