const db =
require('../database/database');

function getRelationshipData(
userId
) {


return new Promise(
    (resolve, reject) => {

        db.get(

            `
            SELECT
                partner_id,
                mother_id,
                father_id
            FROM users
            WHERE id = ?
            `,

            [userId],

            (err, row) => {

                if (err)
                    reject(err);
                else
                    resolve(row);

            }

        );

    }
);


}

function setPartner(
userId1,
userId2
) {


return new Promise(
    (resolve, reject) => {

        db.serialize(() => {

            db.run(

                `
                UPDATE users
                SET partner_id = ?
                WHERE id = ?
                `,

                [
                    userId2,
                    userId1
                ]

            );

            db.run(

                `
                UPDATE users
                SET partner_id = ?
                WHERE id = ?
                `,

                [
                    userId1,
                    userId2
                ],

                err => {

                    if (err)
                        reject(err);
                    else
                        resolve();

                }

            );

        });

    }
);


}

function setMother(
userId,
motherId
) {


return new Promise(
    (resolve, reject) => {

        db.run(

            `
            UPDATE users
            SET mother_id = ?
            WHERE id = ?
            `,

            [
                motherId,
                userId
            ],

            err => {

                if (err)
                    reject(err);
                else
                    resolve();

            }

        );

    }
);


}

function setFather(
userId,
fatherId
) {


return new Promise(
    (resolve, reject) => {

        db.run(

            `
            UPDATE users
            SET father_id = ?
            WHERE id = ?
            `,

            [
                fatherId,
                userId
            ],

            err => {

                if (err)
                    reject(err);
                else
                    resolve();

            }

        );

    }
);


}

function getChildren(
userId
) {


    return new Promise(
        (resolve, reject) => {

            db.all(

                `
                SELECT id
                FROM users
                WHERE
                    mother_id = ?
                    OR father_id = ?
                `,

                [
                    userId,
                    userId
                ],

                (err, rows) => {

                    if (err)
                        reject(err);
                    else
                        resolve(rows);

                }

            );

        }
    );


}

async function getUserName(
    client,
    userId
) {

    if (!userId)
        return null;

    try {

        const user =
            await client.users.fetch(
                userId
            );

        return (
            user.globalName ||
            user.username
        );

    }
    catch {

        return 'Unknown User';

    }

}


function setPartner(
    userId1,
    userId2
) {

    return new Promise(
        (resolve, reject) => {

            db.serialize(() => {

                db.run(
                    `
                    UPDATE users
                    SET partner_id = ?
                    WHERE id = ?
                    `,
                    [
                        userId2,
                        userId1
                    ]
                );

                db.run(
                    `
                    UPDATE users
                    SET partner_id = ?
                    WHERE id = ?
                    `,
                    [
                        userId1,
                        userId2
                    ],

                    err => {

                        if (err)
                            reject(err);
                        else
                            resolve();

                    }

                );

            });

        }
    );

}

function getRelationshipData(
    userId
) {

    return new Promise(
        (resolve, reject) => {

            db.get(
                `
                SELECT
                    partner_id,
                    mother_id,
                    father_id
                FROM users
                WHERE id = ?
                `,
                [userId],

                (err, row) => {

                    if (err)
                        reject(err);
                    else
                        resolve(row);

                }
            );

        }
    );

}


module.exports = {


    getRelationshipData,

    setPartner,

    setMother,

    setFather,

    getChildren,
    
    getUserName,
    setPartner,
    getRelationshipData


};
