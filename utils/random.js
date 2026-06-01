function randomInt(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}

// const fertility = randomInt(10, 15);

function formatNumber(amount) {
    return amount.toLocaleString();
}

// formatNumber(1000000);