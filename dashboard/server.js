const express = require('express');
const path = require('path');

const app = express();

const gifRoutes = require('./routes/gifs');

app.use(
    '/api/gifs',
    gifRoutes
);

app.use(
    express.static(
        path.join(
            __dirname,
            'public'
        )
    )
);

app.get('/', (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            'public',
            'index.html'
        )
    );

});

app.listen(3000, () => {

    console.log(
        'Dashboard running on http://localhost:3000'
    );

});