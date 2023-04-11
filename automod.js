const DiscordJS = require('discord.js');
const guilds_settings = require('./configuration.js');

const words_list = {
    'nazi': 1,
    'salope': 1,
    'pute': 2,
    'enculé': 1,
    'nigga': 1
};

function standardize_word(word) {
    return word.toLowerCase()
        .replace(/[^\w]/gi, '')
        .replace(/œ/gi, '03')
        .replace(/æ/gi, 'a3')
        .replace(/é/gi, '3')
        .replace(/è/gi, '3')
        .replace(/ê/gi, '3')
        .replace(/à/gi, 'a')
        .replace(/â/gi, 'a')
        .replace(/ù/gi, 'u')
        .replace(/û/gi, 'u')
        .replace(/î/gi, '1')
        .replace(/ï/gi, '1')
        .replace(/ô/gi, '0')
        .replace(/ö/gi, '0')
        .replace(/ç/gi, 'c')
        .replace(/ë/gi, '3')
        .replace(/ü/gi, 'u')
        .replace(/ÿ/gi, 'y')
        .replace(/á/gi, 'a')
        .replace(/í/gi, '1')
        .replace(/ó/gi, '0')
        .replace(/ú/gi, 'u')
        .replace(/ý/gi, 'y')
        .replace(/ã/gi, 'a')
        .replace(/õ/gi, '0')
        .replace(/ñ/gi, 'n')
        .replace(/ä/gi, 'a')
        .replace(/o/gi, '0')
        .replace(/l/gi, '1')
        .replace(/i/gi, '1')
        .replace(/s/gi, '5')
        .replace(/z/gi, '5')
        .replace(/(.)\1+/g, '$1')
}

function embed_builder(message, type, word) {
    const embed = new DiscordJS.EmbedBuilder()
        .setColor(type == 1 ? DiscordJS.Colors.Yellow : type == 2 ? DiscordJS.Colors.Orange : DiscordJS.Colors.White).setTimestamp()
        .setTitle('AutoMod')
        .setThumbnail(message.author.avatarURL({ dynamic: true, format: 'png', size: 64 }))
        .setDescription('AutoMod found a suspicious word\nYou might want to check it out!')
        .addFields([
            {name: '`Channel:`', value: `${message.channel}\n**${message.guild} - ${message.channel.name}**`, inline: false},
            {name: '`Author:`', value: `${message.author}\n**${message.author.username}#${message.author.discriminator}**`, inline: false},
            {name: '`Message:`', value: `${message.content}`, inline: false},
            {name: '`Word:`', value: `${word}`, inline: false},
            {name: '`Action:`', value: type == 1 ? 'None' : type == 2 ? 'Deleted' : 'Unknown', inline: false}])
        .setFooter({ text: type == 1 ? 'Flagged' : type == 2 ? 'Deleted' : 'Unknown' })
    return embed;
}

function dm_builder(message, type, word, interaction = null) {
    if (!interaction) {
        const embed = new DiscordJS.EmbedBuilder()
            .setColor(type == 2 ? DiscordJS.Colors.Yellow : type == 3 ? DiscordJS.Colors.Orange : type == 4 ? DiscordJS.Colors.Red : DiscordJS.Colors.White).setTimestamp()
            .setTitle('AutoMod')
            .setThumbnail(message.author.avatarURL({ dynamic: true, format: 'png', size: 64 }))
            .setDescription('AutoMod found a suspicious word\nThe message has been deleted!\n' + `${
                type == 2 ? 'Further actions might be taken after admin review.' :
                type == 3 ? 'After review, you have been kicked from the server!' :
                type == 4 ? 'After review, you have been banned from the server!' : 'No further actions have been taken.'}`)
            .addFields([
                {name: '`Channel:`', value: `${message.channel}\n**${message.guild} - ${message.channel.name}**`, inline: false},
                {name: '`Author:`', value: `${message.author}\n**${message.author.username}#${message.author.discriminator}**`, inline: false},
                {name: '`Message:`', value: `${message.content}`, inline: false},
                {name: '`Word:`', value: `${word}`, inline: false}])
            .setFooter({ text: 'Flagged' })
        return embed;
    } else {
        const embed = new DiscordJS.EmbedBuilder()
        .setColor(type == 2 ? DiscordJS.Colors.Yellow : type == 3 ? DiscordJS.Colors.Orange : type == 4 ? DiscordJS.Colors.Red : DiscordJS.Colors.White).setTimestamp()
        .setTitle('AutoMod')
        .setThumbnail(interaction.user.avatarURL({ dynamic: true, format: 'png', size: 64 }))
        .setDescription('AutoMod found a suspicious word\nThe message has been deleted!\n' + `${
            type == 2 ? 'Further actions might be taken after admin review.' :
            type == 3 ? 'After review, you have been kicked from the server!' :
            type == 4 ? 'After review, you have been banned from the server!' : 'No further actions have been taken.'}`)
        .addFields([
            {name: '`Channel:`', value: `${interaction.message.embeds[0].fields[0].value}`, inline: false},
            {name: '`Author:`', value: `${interaction.message.embeds[0].fields[1].value}`, inline: false},
            {name: '`Message:`', value: `${interaction.message.embeds[0].fields[2].value}`, inline: false},
            {name: '`Word:`', value: `${word}`, inline: false}])
        .setFooter({ text: 'Flagged' })
        return embed;
    }
}

exports.interaction = async function(client, interaction) {
    try {
        await interaction.deferReply({ ephemeral: true });
        const options = interaction.customId.split('_');
        const message = client.guilds.cache.get(interaction.guildId).channels.cache.get(interaction.channelId).messages.cache.get(options[2]);
        const user = client.guilds.cache.get(interaction.guildId).members.cache.get(options[3]);
        var embed = DiscordJS.EmbedBuilder.from(interaction.message.embeds[0]).setColor(DiscordJS.Colors.White).setFooter({text: `Action taken by ${interaction.user.username}#${interaction.user.discriminator}`})
            .setFields([interaction.message.embeds[0].fields[0], interaction.message.embeds[0].fields[1], interaction.message.embeds[0].fields[2], interaction.message.embeds[0].fields[3]]);
        switch (options[1]) {
            case '1':
                embed.addFields({name: '`Action:`', value: interaction.message.embeds[0].fields[4].value == 'Deleted' ? 'Deleted' : 'None', inline: false});
                break;
            case '2':
                embed.addFields({name: '`Action:`', value: 'Deleted', inline: false});
                try {await message.delete()} catch {}
                try {await user.send({ embeds: [dm_builder(message, 2, interaction.message.embeds[0].fields[3].value, interaction)] })} catch (e) {console.log(e)}
                break;
            case '3':
                embed.addFields({name: '`Action:`', value: 'Kicked', inline: false});
                try {await message.delete()} catch {}
                try {await user.send({ embeds: [dm_builder(message, 3, interaction.message.embeds[0].fields[3].value, interaction)] })} catch {}
                try {await user.kick(interaction.message.embeds[0].fields[2].value)} catch {}
                break;
            case '4':
                embed.addFields({name: '`Action:`', value: 'Banned', inline: false});
                try {await message.delete()} catch {}
                try {await user.send({ embeds: [dm_builder(message, 4, interaction.message.embeds[0].fields[3].value, interaction)] })} catch {}
                try {await user.ban(interaction.message.embeds[0].fields[2].value)} catch {}
                break;
            default: break;
        }
        await interaction.message.edit({ embeds: [embed], components: [] });
        await interaction.deleteReply();
    } catch {}
}

exports.audit = async function(client, message, word) {
    const channel = client.channels.cache.get(guilds_settings.get(message.guild.id).auto_mod_channel);
    const embed = embed_builder(message, 1, word);
    const actions = new DiscordJS.ActionRowBuilder().addComponents(
        new DiscordJS.ButtonBuilder()
            .setLabel('Ok')
            .setCustomId(`automod_1_${message.id}_${message.author.id}`)
            .setDisabled(false)
            .setStyle(DiscordJS.ButtonStyle.Success),
        new DiscordJS.ButtonBuilder()
            .setLabel('Delete')
            .setCustomId(`automod_2_${message.id}_${message.author.id}`)
            .setDisabled(false)
            .setStyle(DiscordJS.ButtonStyle.Secondary),
        new DiscordJS.ButtonBuilder()
            .setLabel('Kick')
            .setCustomId(`automod_3_${message.id}_${message.author.id}`)
            .setDisabled(false)
            .setStyle(DiscordJS.ButtonStyle.Primary),
        new DiscordJS.ButtonBuilder()
            .setLabel('Ban')
            .setCustomId(`automod_4_${message.id}_${message.author.id}`)
            .setDisabled(false)
            .setStyle(DiscordJS.ButtonStyle.Danger));
    try {await channel.send({ embeds: [embed], components: [actions] })} catch {}
}

exports.delete = async function(client, message, word) {
    const channel = client.channels.cache.get(guilds_settings.get(message.guild.id).auto_mod_channel);
    const embed = embed_builder(message, 2, word);
    const actions = new DiscordJS.ActionRowBuilder().addComponents(
        new DiscordJS.ButtonBuilder()
            .setLabel('Ok')
            .setCustomId(`automod_1_${message.id}_${message.author.id}`)
            .setDisabled(false)
            .setStyle(DiscordJS.ButtonStyle.Success),
        new DiscordJS.ButtonBuilder()
            .setLabel('Kick')
            .setCustomId(`automod_3_${message.id}_${message.author.id}`)
            .setDisabled(false)
            .setStyle(DiscordJS.ButtonStyle.Primary),
        new DiscordJS.ButtonBuilder()
            .setLabel('Ban')
            .setCustomId(`automod_4_${message.id}_${message.author.id}`)
            .setDisabled(false)
            .setStyle(DiscordJS.ButtonStyle.Danger));
    try {await channel.send({ embeds: [embed], components: [actions] })} catch {}
    try {await message.author.send({ embeds: [dm_builder(message, 2, word)] })} catch {}
    try {await message.delete()} catch {}
}

exports.check = function(client, message) {
    const guild = message.guild;
    const guildId = guild.id;
    const guild_settings = guilds_settings.get(guildId);
    if (!guild_settings) return [0];
    if (!guilds_settings.get(guildId).auto_mod) return [0];

    const channel = client.channels.cache.get(guilds_settings.get(guildId).auto_mod_channel);
    if (!channel) return [0];
    const message_content = standardize_word(message.content);
    const keys = Object.keys(words_list).map((key) => {return [key, words_list[key]]}).sort((first, second) => {return first[1] - second[1]}).map((item) => {return item[0]});
    var result = 0;
    keys.forEach(word => {if (message_content.includes(standardize_word(word))) result = [words_list[word], word]})
    return result;
}