const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => {

    const categories = [];

    function scan(dir, prefix = '') {

        const items =
            fs.readdirSync(dir);

        for (const item of items) {

            const fullPath =
                path.join(dir, item);

            const stat =
                fs.statSync(fullPath);

            if (stat.isDirectory()) {

                scan(
                    fullPath,
                    `${prefix}${item}/`
                );

            } else if (
                item.endsWith('.json')
            ) {

                categories.push(
                    prefix +
                    item.replace('.json', '')
                );

            }

        }

    }

    scan(
        path.join(
            __dirname,
            '../../data/gifs'
        ),
        'gifs/'
    );

    scan(
        path.join(
            __dirname,
            '../../data/scenes'
        ),
        'scenes/'
    );

    res.json(categories);

});

module.exports = router;