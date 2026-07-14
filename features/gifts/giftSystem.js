const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { CHANNELS, COLORS, getRandomColor } = require('../../data/constants');
const { createEmbed, createUserEmbed, getDisplayName } = require('../../utils/embeds');
const { mpcLogoAttachment } = require('../../utils/mpcLogo');
const { commandFooter } = require('../../utils/version');
const { getOrCreateUser } = require('../../utils/users');
const { CATEGORY_ORDER, calculateGiftCollectionValue, getDailyGiftShop, getGiftDefinition, getGiftInventory, getGiftReset, getReceivedGiftCollection, purchaseGift, sendGift, sortCollection } = require('../../utils/gifts');
const { claimButton, replyButtonAlreadyUsed } = require('../../utils/buttonDedup');

const categoryNames = { common: 'Common', uncommon: 'Uncommon', premium: 'Premium', luxury: 'Luxury' };
const flavor = {
    common: ['{sender} quietly made {receiver}\'s night a little sweeter.', 'A thoughtful surprise found its way from {sender} to {receiver}.'],
    uncommon: ['{sender} decided {receiver} deserved a little spoiling.', 'A special delivery arrived for {receiver}, courtesy of {sender}.'],
    premium: ['{sender} was clearly in the mood to spoil {receiver}.', '{sender} made sure {receiver} would remember tonight.'],
    luxury: ['{sender} clearly decided subtlety was overrated.', '{receiver}\'s collection just entered a different tax bracket.']
};

function groupLines(items) {
    return CATEGORY_ORDER.map((category) => {
        const lines = items.filter((gift) => gift.category === category).map((gift) => `- ${gift.emoji} ${gift.name} ×${gift.quantity}`);
        return lines.length ? `**${categoryNames[category]}**\n${lines.join('\n')}` : null;
    }).filter(Boolean).join('\n\n');
}

async function buildGiftShopReply(interaction, notice) {
    const user = await getOrCreateUser(interaction.user.id);
    const reset = getGiftReset();
    const shop = await getDailyGiftShop(interaction.user.id, reset.key);
    const embed = createUserEmbed(interaction, { color: notice?.error ? COLORS.ERROR : COLORS.DEFAULT, command: '/shop gifts', title: 'Daily Gift Shop', description: `${notice?.text ? `${notice.text}\n\n` : ''}Buy a little something for someone special. Gifts provide no gameplay rewards.\n\nBalance: **${user.coins} coins**\nNext rotation: <t:${reset.nextTimestamp}:R>\n\n${shop.map((gift) => `${gift.emoji} **${gift.name}** — ${gift.price} coins • ${categoryNames[gift.category]}`).join('\n')}` });
    return { embeds: [embed], components: [new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId(`gift_shop:${interaction.user.id}:${reset.key}`).setPlaceholder('Choose a gift').addOptions(shop.map((gift) => ({ label: gift.name, description: `${gift.price} coins • ${categoryNames[gift.category]}`, emoji: gift.emoji, value: gift.key }))))] };
}

async function showGiftPurchaseConfirmation(interaction) {
    const [, ownerId, resetKey] = interaction.customId.split(':');
    if (interaction.user.id !== ownerId) return interaction.reply({ content: 'This gift shop belongs to someone else.', flags: 64 });
    const gift = getGiftDefinition(interaction.values[0]);
    const currentReset = getGiftReset();
    if (!gift || resetKey !== currentReset.key) return interaction.update(await buildGiftShopReply(interaction, { error: true, text: 'That shop rotation expired.' }));
    const shop = await getDailyGiftShop(ownerId, resetKey);
    if (!shop.some((item) => item.key === gift.key)) return interaction.reply({ content: 'That gift is not in this shop.', flags: 64 });
    const [user, inventory] = await Promise.all([getOrCreateUser(ownerId), getGiftInventory(ownerId)]);
    const owned = inventory.find((item) => item.key === gift.key)?.quantity ?? 0;
    const expires = Math.min(currentReset.nextTimestamp, Math.floor(Date.now() / 1000) + 600);
    const embed = createUserEmbed(interaction, { command: '/shop gifts', title: 'Confirm Gift Purchase', description: `${gift.emoji} **${gift.name}**\n\nCurrently owned: **${owned}**\nPrice: **${gift.price} coins**\nBalance after purchase: **${user.coins - gift.price} coins**` });
    return interaction.update({ embeds: [embed], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`gift_buy:${ownerId}:${gift.key}:${resetKey}:${expires}`).setLabel('Buy Gift').setStyle(ButtonStyle.Success).setDisabled(user.coins < gift.price), new ButtonBuilder().setCustomId(`gift_cancel_shop:${ownerId}`).setLabel('Cancel').setStyle(ButtonStyle.Secondary))] });
}

async function confirmGiftPurchase(interaction) {
    const [, ownerId, giftKey, resetKey, expires] = interaction.customId.split(':');
    if (interaction.user.id !== ownerId) return interaction.reply({ content: 'This confirmation belongs to someone else.', flags: 64 });
    if (!claimButton(interaction)) return replyButtonAlreadyUsed(interaction);
    if (Date.now() / 1000 > Number(expires) || getGiftReset().key !== resetKey) return interaction.update({ content: 'This purchase confirmation expired. Open `/shop gifts` again.', embeds: [], components: [] });
    try { const result = await purchaseGift(ownerId, giftKey, resetKey); return interaction.update({ content: `Bought ${result.gift.emoji} **${result.gift.name}**. You now own **${result.quantity}**. Remaining balance: **${result.balance} coins**.`, embeds: [], components: [] }); }
    catch (error) { return interaction.update({ content: error.message, embeds: [], components: [] }); }
}

async function showGiftInventory(interaction) {
    const items = await getGiftInventory(interaction.user.id);
    const total = items.reduce((sum, gift) => sum + gift.quantity, 0);
    const description = items.length ? `${groupLines(items)}\n\nTotal gift items: **${total}**\nUnique gift types: **${items.length}**` : 'Your gift inventory is empty. Purchase gifts through `/shop gifts`.';
    return interaction.editReply({ embeds: [createUserEmbed(interaction, { command: '/inventory gifts', title: 'Sendable Gift Inventory', description })] });
}

async function startGiftSend(interaction, receiver) {
    const inventory = await getGiftInventory(interaction.user.id);
    if (!inventory.length) return interaction.editReply({ content: 'You do not own any sendable gifts. Use `/shop gifts` to buy some.' });
    const embed = createUserEmbed(interaction, { command: '/gift send', title: 'Choose a Gift', description: `Choose a gift to send to <@${receiver.id}>.` });
    return interaction.editReply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId(`gift_send_select:${interaction.user.id}:${receiver.id}`).setPlaceholder('Choose an owned gift').addOptions(inventory.map((gift) => ({ label: gift.name, description: `Owned: ${gift.quantity}`, emoji: gift.emoji, value: gift.key }))))] });
}

async function showGiftSendConfirmation(interaction) {
    const [, senderId, receiverId] = interaction.customId.split(':');
    if (interaction.user.id !== senderId) return interaction.reply({ content: 'This gift panel belongs to someone else.', flags: 64 });
    const gift = getGiftDefinition(interaction.values[0]);
    const quantity = (await getGiftInventory(senderId)).find((item) => item.key === gift?.key)?.quantity ?? 0;
    if (!gift || !quantity) return interaction.update({ content: 'You no longer own that gift.', embeds: [], components: [] });
    const expires = Math.floor(Date.now() / 1000) + 600;
    return interaction.update({ embeds: [createUserEmbed(interaction, { command: '/gift send', title: 'Confirm Gift', description: `Send ${gift.emoji} **${gift.name}** to <@${receiverId}>?\n\nYou currently own **${quantity}**.\nAfter sending: **${quantity - 1}**.` })], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`gift_send_confirm:${senderId}:${receiverId}:${gift.key}:${expires}`).setLabel('Send Gift').setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId(`gift_cancel_send:${senderId}`).setLabel('Cancel').setStyle(ButtonStyle.Secondary))] });
}

async function postGiftNotification(interaction, receiverId, gift) {
    const receiver = await interaction.guild.members.fetch(receiverId);
    const senderName = interaction.member.displayName;
    const senderMention = `<@${interaction.user.id}>`;
    const receiverMention = `<@${receiverId}>`;
    const intro = flavor[gift.category][Math.floor(Math.random() * flavor[gift.category].length)].replace('{sender}', senderMention).replace('{receiver}', receiverMention);
    const embed = createEmbed({ color: getRandomColor(), authorName: senderName, authorIcon: interaction.user.displayAvatarURL(), thumbnail: receiver.user.displayAvatarURL(), title: gift.category === 'luxury' ? 'Living the Dream' : 'A Midnight Gift', description: `${intro}\n\n${senderMention} gave ${receiverMention} a ${gift.emoji} **${gift.name}**.\n\nThe gift now has a permanent place in ${receiverMention}'s collection.`, footerText: commandFooter('/gift send'), timestamp: true });
    const channel = await interaction.client.channels.fetch(CHANNELS.PILLOW_TALK);
    await channel.send({ content: receiverMention, embeds: [embed], allowedMentions: { users: [receiverId] } });
}

async function confirmGiftSend(interaction) {
    const [, senderId, receiverId, giftKey, expires] = interaction.customId.split(':');
    if (interaction.user.id !== senderId) return interaction.reply({ content: 'This confirmation belongs to someone else.', flags: 64 });
    if (!claimButton(interaction)) return replyButtonAlreadyUsed(interaction);
    if (Date.now() / 1000 > Number(expires)) return interaction.update({ content: 'This gift confirmation expired. Run `/gift send` again.', embeds: [], components: [] });
    const receiver = await interaction.guild.members.fetch(receiverId).catch(() => null);
    if (!receiver || receiver.user.bot || receiverId === senderId) return interaction.update({ content: 'The receiver is no longer a valid server member.', embeds: [], components: [] });
    let result;
    try { result = await sendGift(senderId, receiverId, giftKey); }
    catch (error) { return interaction.update({ content: error.message, embeds: [], components: [] }); }
    await interaction.update({ content: `Sent ${result.gift.emoji} **${result.gift.name}** to <@${receiverId}>.`, embeds: [], components: [] });
    await postGiftNotification(interaction, receiverId, result.gift).catch((error) => console.error('GIFT PILLOW TALK POST ERROR', error));
}

async function showReceivedCollection(interaction, userId) {
    const member = await interaction.guild.members.fetch(userId).catch(() => null);
    const items = sortCollection(await getReceivedGiftCollection(userId));
    const total = items.reduce((sum, gift) => sum + gift.quantity, 0);
    const value = await calculateGiftCollectionValue(userId);
    const description = items.length ? `${groupLines(items)}\n\nTotal received: **${total}**\nUnique gifts: **${items.length}**\nCollection value: **${value.toLocaleString()} coins**` : 'No gifts received yet.';
    const embed = createEmbed({ color: COLORS.DEFAULT, authorName: getDisplayName(member), authorIcon: mpcLogoAttachment, thumbnail: member?.user.displayAvatarURL(), title: `Gift Collection — ${getDisplayName(member)}`, description, footerText: commandFooter('/profile', 'Gift Collection'), timestamp: true });
    return interaction.reply({ embeds: [embed], flags: 64 });
}

async function cancelGiftInteraction(interaction) { const ownerId = interaction.customId.split(':')[1]; if (interaction.user.id !== ownerId) return interaction.reply({ content: 'This confirmation belongs to someone else.', flags: 64 }); return interaction.update({ content: 'Cancelled.', embeds: [], components: [] }); }

module.exports = { buildGiftShopReply, cancelGiftInteraction, confirmGiftPurchase, confirmGiftSend, showGiftInventory, showGiftPurchaseConfirmation, showGiftSendConfirmation, showReceivedCollection, startGiftSend };
