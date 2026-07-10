const crypto = require('crypto');
const db = require('../database/database');
const gifts = require('../data/gifts/gifts');
const { getOrCreateUser } = require('./users');
const { getDailyQuestDate, getNextResetTimestamp } = require('../features/daily-quests/dailyQuests');

const CATEGORY_ORDER = ['common', 'uncommon', 'premium', 'luxury'];
const CATEGORY_COUNTS = { common: 2, uncommon: 2, premium: 1, luxury: 1 };
const giftMap = new Map(gifts.map((gift) => [gift.key, gift]));

function getGiftDefinition(key) { return giftMap.get(key) ?? null; }
function all(sql, params = []) { return new Promise((resolve, reject) => db.all(sql, params, (e, rows) => e ? reject(e) : resolve(rows))); }
function get(sql, params = []) { return new Promise((resolve, reject) => db.get(sql, params, (e, row) => e ? reject(e) : resolve(row))); }
function run(sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, function done(e) { e ? reject(e) : resolve({ changes: this.changes, lastID: this.lastID }); })); }

function getGiftReset(now = new Date()) {
    return { key: getDailyQuestDate(now), nextTimestamp: getNextResetTimestamp(now) };
}

function seededOrder(userId, resetKey, category) {
    return gifts.filter((gift) => gift.category === category).sort((a, b) =>
        crypto.createHash('sha256').update(`${userId}:${resetKey}:${category}:${a.key}`).digest('hex')
            .localeCompare(crypto.createHash('sha256').update(`${userId}:${resetKey}:${category}:${b.key}`).digest('hex')));
}

function generateDailyGiftShop(userId, resetKey) {
    return CATEGORY_ORDER.flatMap((category) => seededOrder(userId, resetKey, category).slice(0, CATEGORY_COUNTS[category]).map((gift) => gift.key));
}

async function getDailyGiftShop(userId, resetKey = getGiftReset().key) {
    const existing = await get('SELECT gift_keys_json FROM user_daily_gift_shop WHERE user_id = ? AND reset_key = ?', [userId, resetKey]);
    if (existing) return JSON.parse(existing.gift_keys_json).map(getGiftDefinition).filter(Boolean);
    const keys = generateDailyGiftShop(userId, resetKey);
    await run('INSERT OR IGNORE INTO user_daily_gift_shop (user_id, reset_key, gift_keys_json, created_at) VALUES (?, ?, ?, ?)', [userId, resetKey, JSON.stringify(keys), Math.floor(Date.now() / 1000)]);
    const stored = await get('SELECT gift_keys_json FROM user_daily_gift_shop WHERE user_id = ? AND reset_key = ?', [userId, resetKey]);
    return JSON.parse(stored.gift_keys_json).map(getGiftDefinition).filter(Boolean);
}

async function getGiftInventory(userId) {
    const rows = await all('SELECT gift_key, quantity FROM user_gift_inventory WHERE user_id = ? AND quantity > 0', [userId]);
    return rows.map((row) => ({ ...getGiftDefinition(row.gift_key), quantity: row.quantity })).filter((gift) => gift.key);
}

async function getReceivedGiftCollection(userId) {
    const rows = await all('SELECT gift_key, quantity, total_value FROM user_received_gifts WHERE user_id = ? AND quantity > 0', [userId]);
    return rows.map((row) => ({ ...getGiftDefinition(row.gift_key), quantity: row.quantity, totalValue: row.total_value })).filter((gift) => gift.key);
}

function transaction(work) {
    return new Promise((resolve, reject) => db.serialize(() => {
        db.run('BEGIN IMMEDIATE', async (beginError) => {
            if (beginError) return reject(beginError);
            try { const result = await work(); db.run('COMMIT', (e) => e ? reject(e) : resolve(result)); }
            catch (error) { db.run('ROLLBACK', () => reject(error)); }
        });
    }));
}

async function purchaseGift(userId, giftKey, resetKey = getGiftReset().key) {
    const gift = getGiftDefinition(giftKey);
    if (!gift) throw new Error('That gift does not exist.');
    const shop = await getDailyGiftShop(userId, resetKey);
    if (!shop.some((item) => item.key === giftKey)) throw new Error('That gift is no longer in your daily shop.');
    await getOrCreateUser(userId);
    return transaction(async () => {
        const spent = await run('UPDATE users SET coins = coins - ? WHERE id = ? AND coins >= ?', [gift.price, userId, gift.price]);
        if (!spent.changes) throw new Error('You do not have enough coins for that gift.');
        await run(`INSERT INTO user_gift_inventory (user_id, gift_key, quantity) VALUES (?, ?, 1)
            ON CONFLICT(user_id, gift_key) DO UPDATE SET quantity = quantity + 1`, [userId, giftKey]);
        await run('INSERT INTO gift_purchases (user_id, gift_key, price_paid, quantity_remaining, purchased_at) VALUES (?, ?, ?, 1, ?)', [userId, giftKey, gift.price, Math.floor(Date.now() / 1000)]);
        const inventory = await get('SELECT quantity FROM user_gift_inventory WHERE user_id = ? AND gift_key = ?', [userId, giftKey]);
        const user = await get('SELECT coins FROM users WHERE id = ?', [userId]);
        return { gift, quantity: inventory.quantity, balance: user.coins };
    });
}

async function sendGift(senderId, receiverId, giftKey) {
    const gift = getGiftDefinition(giftKey);
    if (!gift) throw new Error('That gift does not exist.');
    return transaction(async () => {
        const removed = await run('UPDATE user_gift_inventory SET quantity = quantity - 1 WHERE user_id = ? AND gift_key = ? AND quantity > 0', [senderId, giftKey]);
        if (!removed.changes) throw new Error('You no longer own that gift.');
        const lot = await get('SELECT id, price_paid FROM gift_purchases WHERE user_id = ? AND gift_key = ? AND quantity_remaining > 0 ORDER BY id LIMIT 1', [senderId, giftKey]);
        const pricePaid = lot?.price_paid ?? gift.price;
        if (lot) await run('UPDATE gift_purchases SET quantity_remaining = quantity_remaining - 1 WHERE id = ?', [lot.id]);
        await run(`INSERT INTO user_received_gifts (user_id, gift_key, quantity, total_value) VALUES (?, ?, 1, ?)
            ON CONFLICT(user_id, gift_key) DO UPDATE SET quantity = quantity + 1, total_value = total_value + excluded.total_value`, [receiverId, giftKey, pricePaid]);
        await run('INSERT INTO gift_transactions (sender_id, receiver_id, gift_key, price_paid, sent_at) VALUES (?, ?, ?, ?, ?)', [senderId, receiverId, giftKey, pricePaid, Math.floor(Date.now() / 1000)]);
        return { gift, pricePaid };
    });
}

function sortCollection(items) {
    return [...items].sort((a, b) => CATEGORY_ORDER.indexOf(b.category) - CATEGORY_ORDER.indexOf(a.category) || b.price - a.price || b.quantity - a.quantity);
}

async function getGiftCollectionPreview(userId) { return sortCollection(await getReceivedGiftCollection(userId)).slice(0, 4); }
async function calculateGiftCollectionValue(userId) { return (await getReceivedGiftCollection(userId)).reduce((sum, gift) => sum + gift.totalValue, 0); }

module.exports = { CATEGORY_ORDER, calculateGiftCollectionValue, generateDailyGiftShop, getDailyGiftShop, getGiftCollectionPreview, getGiftDefinition, getGiftInventory, getGiftReset, getReceivedGiftCollection, purchaseGift, sendGift, sortCollection };
