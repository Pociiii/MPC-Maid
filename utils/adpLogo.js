const path =
    require('path');

const adpLogoPath =
    path.join(
        __dirname,
        '..',
        'assets',
        'ADP_logo.png'
    );

const adpLogoAttachment =
    'attachment://ADP_logo.png';

module.exports = {
    adpLogoPath,
    adpLogoAttachment
};
