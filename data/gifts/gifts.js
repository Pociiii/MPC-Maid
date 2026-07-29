const {
    ECONOMY
} = require('../constants');

const gifts = [
    // Common
    { key: 'rose', name: 'Rose', emoji: '🌹', category: 'common', price: 40 },
    { key: 'coffee', name: 'Coffee', emoji: '☕', category: 'common', price: 50 },
    { key: 'chocolate', name: 'Chocolate', emoji: '🍫', category: 'common', price: 60 },
    { key: 'love_letter', name: 'Love Letter', emoji: '💌', category: 'common', price: 75 },
    { key: 'lipstick_kiss', name: 'Lipstick Kiss', emoji: '💋', category: 'common', price: 80 },
    { key: 'heart_balloon', name: 'Heart Balloon', emoji: '🎈', category: 'common', price: 70 },
    { key: 'cookie', name: 'Cookie', emoji: '🍪', category: 'common', price: 45 },
    { key: 'lollipop', name: 'Lollipop', emoji: '🍭', category: 'common', price: 55 },
    { key: 'ice_cream', name: 'Ice Cream', emoji: '🍦', category: 'common', price: 65 },
    { key: 'peach', name: 'Peach', emoji: '🍑', category: 'common', price: 90 },
    { key: 'baby_booties', name: 'Baby Booties', emoji: '🧦', category: 'common', price: 120 },
    { key: 'baby_bottle', name: 'Baby Bottle', emoji: '🍼', category: 'common', price: 160 },
    { key: 'strawberries', name: 'Chocolate Strawberries', emoji: '🍓', category: 'common', price: 110 },
    { key: 'massage_oil', name: 'Massage Oil', emoji: '🧴', category: 'common', price: 180 },
    { key: 'rose_petals', name: 'Rose Petals', emoji: '🥀', category: 'common', price: 140 },

    // Uncommon
    { key: 'teddy_bear', name: 'Teddy Bear', emoji: '🧸', category: 'uncommon', price: 150 },
    { key: 'flower_bouquet', name: 'Flower Bouquet', emoji: '💐', category: 'uncommon', price: 220 },
    { key: 'perfume', name: 'Perfume', emoji: '🧴', category: 'uncommon', price: 260 },
    { key: 'champagne', name: 'Champagne', emoji: '🍾', category: 'uncommon', price: 300 },
    { key: 'lingerie', name: 'Lingerie', emoji: '👙', category: 'uncommon', price: 350 },
    { key: 'handcuffs', name: 'Handcuffs', emoji: '⛓️', category: 'uncommon', price: 380 },
    { key: 'whip', name: 'Whip', emoji: '🪢', category: 'uncommon', price: 420 },
    { key: 'cocktail', name: 'Cocktail', emoji: '🍸', category: 'uncommon', price: 240 },
    { key: 'movie_night', name: 'Movie Night', emoji: '🎬', category: 'uncommon', price: 280 },
    { key: 'candle_dinner', name: 'Candle Dinner', emoji: '🕯️', category: 'uncommon', price: 400 },
    { key: 'pregnancy_pillow', name: 'Pregnancy Pillow', emoji: '🛏️', category: 'uncommon', price: 450 },
    { key: 'ultrasound_photo', name: 'Ultrasound Photo', emoji: '🩻', category: 'uncommon', price: 600 },  
    { key: 'baby_plushie', name: 'Baby Plushie', emoji: '🧸', category: 'uncommon', price: 380 },
    { key: 'wine', name: 'Fine Wine', emoji: '🍷', category: 'uncommon', price: 260 },
    { key: 'breakfast_bed', name: 'Breakfast in Bed', emoji: '🥐', category: 'uncommon', price: 350 },
    { key: 'sushi_date', name: 'Sushi Date', emoji: '🍣', category: 'uncommon', price: 420 },
    { key: 'silk_blindfold', name: 'Silk Blindfold', emoji: '🙈', category: 'uncommon', price: 320 },
    { key: 'lace_stockings', name: 'Lace Stockings', emoji: '🧦', category: 'uncommon', price: 340 },

    // Premium
    { key: 'designer_heels', name: 'Stilettos', emoji: '👠', category: 'premium', price: 650 },
    { key: 'diamond_ring', name: 'Diamond Ring', emoji: '💍', category: 'premium', price: 900 },
    { key: 'luxury_trip', name: 'Luxury Trip', emoji: '🏝️', category: 'premium', price: 1200 },
    { key: 'private_jet_trip', name: 'Private Jet Trip', emoji: '🛩️', category: 'premium', price: 1600 },
    { key: 'diamond_necklace', name: 'Diamond Necklace', emoji: '📿', category: 'premium', price: 1400 },
    { key: 'vip_suite', name: 'VIP Suite', emoji: '🏨', category: 'premium', price: 1800 },
    { key: 'gold_watch', name: 'Gold Watch', emoji: '⌚', category: 'premium', price: 1500 },
    { key: 'spa_day', name: 'Spa Day', emoji: '🛁', category: 'premium', price: 1100 },
    { key: 'crown', name: 'Crown', emoji: '👑', category: 'premium', price: 1700 },
    { key: 'moonlight_cruise', name: 'Midnight Cruise', emoji: '🚢', category: 'premium', price: 1900 },
    { key: 'stroller', name: 'Luxury Stroller', emoji: '👶', category: 'premium', price: 1800 },
    { key: 'nursery', name: 'Nursery Decoration', emoji: '🛏️', category: 'premium', price: 2500 },
    { key: 'matching_rings', name: 'Matching Rings', emoji: '💞', category: 'premium', price: 1300 },
    { key: 'couple_photoshoot', name: 'Couple Photoshoot', emoji: '📸', category: 'premium', price: 1400 },
    { key: 'weekend_getaway', name: 'Weekend Getaway', emoji: '🏖️', category: 'premium', price: 2200 },
    { key: 'latex_outfit', name: 'Latex Outfit', emoji: '🖤', category: 'premium', price: 900 },
    { key: 'love_potion', name: 'Love Potion', emoji: '🧪', category: 'premium', price: 1100 },
    
    // Luxury
    { key: 'motorcycle', name: 'Motorcycle', emoji: '🏍️', category: 'luxury', price: 2500 },
    { key: 'sports_car', name: 'Sports Car', emoji: '🏎️', category: 'luxury', price: 5000 },
    { key: 'private_yacht', name: 'Private Yacht', emoji: '🛥️', category: 'luxury', price: 7500 },
    { key: 'private_island', name: 'Private Island', emoji: '🏝️', category: 'luxury', price: 9000 },
    { key: 'midnight_mansion', name: 'Midnight Mansion', emoji: '🏠', category: 'luxury', price: 10000 },
    { key: 'penthouse', name: 'Penthouse', emoji: '🏙️', category: 'luxury', price: 12000 },
    { key: 'superyacht', name: 'Superyacht', emoji: '🛳️', category: 'luxury', price: 15000 },
    { key: 'private_heli', name: 'Private Helicopter', emoji: '🚁', category: 'luxury', price: 18000 },
    { key: 'moon', name: 'The Moon', emoji: '🌙', category: 'luxury', price: 25000 },
    { key: 'golden_throne', name: 'Golden Throne', emoji: '🪙', category: 'luxury', price: 30000 },
    { key: 'star_named', name: 'Name a Star', emoji: '⭐', category: 'luxury', price: 12000 }
];

module.exports = gifts.map(
    (gift) => ({
        ...gift,
        price:
            Math.ceil(
                gift.price *
                ECONOMY.GIFT_PRICE_MULTIPLIER /
                5
            ) * 5
    })
);
