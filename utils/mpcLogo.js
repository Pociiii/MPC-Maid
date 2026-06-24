const path =
    require('path');

const mpcLogoPath =
    path.join(
        __dirname,
        '..',
        'assets',
        'MPC_logo.png'
    );

const mpcLogoAttachment =
    'attachment://MPC_logo.png';

module.exports = {
    mpcLogoAttachment,
    mpcLogoPath
};
