const db =
    require('../database/database');

const RESET_HOUR_UTC =
    12;

const DAY_MS =
    24 * 60 * 60 * 1000;

function getCoinIncomeDate(
    now = new Date()
) {

    return new Date(
        now.getTime() - RESET_HOUR_UTC * 60 * 60 * 1000
    ).toISOString().slice(
        0,
        10
    );

}

function getPreviousCoinIncomeDate(
    now = new Date()
) {

    return getCoinIncomeDate(
        new Date(
            now.getTime() - DAY_MS
        )
    );

}

function recordCoinIncome(
    userId,
    amount,
    source,
    incomeDate = getCoinIncomeDate()
) {

    const earned =
        Math.floor(
            Number(
                amount
            )
        );

    if (
        !source ||
        !Number.isFinite(
            earned
        ) ||
        earned <= 0
    )
        return Promise.resolve(
            false
        );

    return new Promise(
        (resolve, reject) =>
            db.run(
                `INSERT INTO user_coin_income (
                    user_id, income_date, source, amount, updated_at
                 ) VALUES (?, ?, ?, ?, ?)
                 ON CONFLICT(user_id, income_date, source)
                 DO UPDATE SET
                    amount = amount + excluded.amount,
                    updated_at = excluded.updated_at`,
                [
                    userId,
                    incomeDate,
                    source,
                    earned,
                    Date.now()
                ],
                function onRecord(
                    error
                ) {

                    error
                        ? reject(
                            error
                        )
                        : resolve(
                            this.changes > 0
                        );

                }
            )
    );

}

function getCoinIncome(
    userId,
    incomeDate
) {

    return new Promise(
        (resolve, reject) =>
            db.get(
                `SELECT COALESCE(SUM(amount), 0) AS amount
                 FROM user_coin_income
                 WHERE user_id = ? AND income_date = ?`,
                [
                    userId,
                    incomeDate
                ],
                (error, row) =>
                    error
                        ? reject(
                            error
                        )
                        : resolve(
                            Number(
                                row?.amount ?? 0
                            )
                        )
            )
    );

}

module.exports = {
    getCoinIncome,
    getCoinIncomeDate,
    getPreviousCoinIncomeDate,
    recordCoinIncome
};
