const db =
    require('../../database/database');

function runUserUpdate(
    query,
    params
) {

    return new Promise(
        (resolve, reject) => {

            db.run(
                query,
                params,
                (error) =>
                    error
                        ? reject(
                            error
                        )
                        : resolve()
            );

        }
    );

}

module.exports = {
    runUserUpdate
};
