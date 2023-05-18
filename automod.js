const fs = require('fs');
const file_path = './badwords.json';
const DiscordJS = require('discord.js');
const guilds_settings = require('./configuration.js');
const user_scores = require('./userscores.js');

var words_list = {};

function standardize_word(word) {
    return word.toLowerCase()
        .replace(/[^\w]/gi, '')
        .replace(/œ/gi, '03')
        .replace(/æ/gi, 'a3')
        .replace(/é/gi, '3')
        .replace(/è/gi, '3')
        .replace(/ê/gi, '3')
        .replace(/à/gi, '4')
        .replace(/â/gi, '4')
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
        .replace(/á/gi, '4')
        .replace(/í/gi, '1')
        .replace(/ó/gi, '0')
        .replace(/ú/gi, 'u')
        .replace(/ý/gi, 'y')
        .replace(/ã/gi, '4')
        .replace(/õ/gi, '0')
        .replace(/ñ/gi, 'n')
        .replace(/ä/gi, '4')
        .replace(/a/gi, '4')
        .replace(/o/gi, '0')
        .replace(/l/gi, '1')
        .replace(/i/gi, '1')
        .replace(/s/gi, '5')
        .replace(/z/gi, '5')
        .replace(/(.)\1+/g, '$1')
}

function embed_builder(message, score, words) {
    const embed = new DiscordJS.EmbedBuilder()
        .setColor(DiscordJS.Colors.Yellow).setTimestamp()
        .setTitle('AutoMod')
        .setThumbnail(message.author.avatarURL({ dynamic: true, format: 'png', size: 64 }))
        .setDescription('AutoMod found suspicious words\nYou might want to check it out!')
        .addFields([
            {name: '`Channel:`', value: `${message.channel}\n**${message.guild} - ${message.channel.name}**`, inline: false},
            {name: '`Author:`', value: `${message.author}\n**${message.author.username}#${message.author.discriminator}**`, inline: false},
            {name: '`Score:`', value: `${user_scores.get(message.author.id)['score']}`, inline: false},
            {name: '`Message:`', value: `${message.content}`, inline: false},
            {name: '`Words:`', value: `${words.join(", ")}`, inline: false},
            {name: '`Weight:`', value: `${score}`, inline: false},
            {name: '`Action:`', value: 'Under review', inline: false}])
        .setFooter({ text: 'Flagged' })
    return embed;
}

function dm_builder(type, words, interaction) {
    const embed = new DiscordJS.EmbedBuilder()
    .setColor(type == 2 ? DiscordJS.Colors.Yellow : type == 3 ? DiscordJS.Colors.Orange : type == 4 ? DiscordJS.Colors.Red : DiscordJS.Colors.White).setTimestamp()
    .setTitle('AutoMod')
    .setThumbnail(interaction.user.avatarURL({ dynamic: true, format: 'png', size: 64 }))
    .setDescription('AutoMod found suspicious words\n' + `${
        type == 2 ? 'After review, you\'re message has been deleted!' :
        type == 3 ? 'After review, you have been kicked from the server!' :
        type == 4 ? 'After review, you have been banned from the server!' : 'No further actions have been taken.'}`)
    .addFields([
        {name: '`Channel:`', value: `${interaction.message.embeds[0].fields[0].value}`, inline: false},
        {name: '`Author:`', value: `${interaction.message.embeds[0].fields[1].value}`, inline: false},
        {name: '`Message:`', value: `${interaction.message.embeds[0].fields[3].value}`, inline: false},
        {name: '`Words:`', value: `${words}`, inline: false}])
    .setFooter({ text: 'Flagged' })
    return embed;
}

exports.interaction = async function(client, interaction) {
    try {
        await interaction.deferReply({ ephemeral: true });
        if (!interaction.member.permissions.has(DiscordJS.PermissionFlagsBits.ManageMessages)) {return await interaction.editReply({ content: 'You do not have permission to do that!' });}
        const options = interaction.customId.split('_');
        const user = client.guilds.cache.get(interaction.guildId).members.cache.get(options[3]);
        const score = parseInt(options[4]);
        const message = await client.guilds.cache.get(interaction.guildId).channels.cache.get(interaction.message.embeds[0].fields[0].value.match(/<#(\d+)>/)?.[1]).messages.fetch(options[2]);
        var embed = DiscordJS.EmbedBuilder.from(interaction.message.embeds[0]).setColor(DiscordJS.Colors.White).setFooter({text: `Action taken by ${interaction.user.username}#${interaction.user.discriminator}`})
            .setFields([interaction.message.embeds[0].fields[0], interaction.message.embeds[0].fields[1], interaction.message.embeds[0].fields[2], interaction.message.embeds[0].fields[3], interaction.message.embeds[0].fields[4]]);
        switch (options[1]) {
            case '1':
                embed.addFields({name: '`Action:`', value: 'None', inline: false});
                break;
            case '2':
                try {await message.delete()} catch {}
                embed.addFields({name: '`Action:`', value: 'Deleted', inline: false});
                await user_scores.add(user.id, `${user.user.username}#${user.user.discriminator}`, interaction.member.guild.name, score);
                try {await user.send({ embeds: [dm_builder(2, interaction.message.embeds[0].fields[4].value, interaction)] })} catch {}
                break;
            case '3':
                if (!interaction.member.permissions.has(DiscordJS.PermissionFlagsBits.KickMembers)) {return await interaction.editReply({ content: 'You do not have permission to do that!' });}
                try {await message.delete()} catch {}
                embed.addFields({name: '`Action:`', value: 'Kicked', inline: false});
                await user_scores.add(user.id, `${user.user.username}#${user.user.discriminator}`, interaction.member.guild.name, score + 1);
                try {await user.send({ embeds: [dm_builder(3, interaction.message.embeds[0].fields[4].value, interaction)] })} catch {}
                try {await user.kick(interaction.message.embeds[0].fields[3].value)} catch {}
                break;
            case '4':
                if (!interaction.member.permissions.has(DiscordJS.PermissionFlagsBits.BanMembers)) {return await interaction.editReply({ content: 'You do not have permission to do that!' });}
                try {await message.delete()} catch {}
                embed.addFields({name: '`Action:`', value: 'Banned', inline: false});
                await user_scores.add(user.id, `${user.user.username}#${user.user.discriminator}`, interaction.member.guild.name, score + 2);
                try {await user.send({ embeds: [dm_builder(4, interaction.message.embeds[0].fields[4].value, interaction)] })} catch {}
                try {await user.ban(interaction.message.embeds[0].fields[3].value)} catch {}
                break;
            default: break;
        }
        await user_scores.save();
        await interaction.message.edit({ embeds: [embed], components: [] });
        await interaction.deleteReply();
    } catch (e) {console.error(e)}
}

exports.audit = async function(client, message, score, words) {
    const channel = client.channels.cache.get(guilds_settings.get(message.guild.id).auto_mod_channel);
    if (!channel) {return}
    const embed = embed_builder(message, score, words);
    const actions = new DiscordJS.ActionRowBuilder().addComponents(
        new DiscordJS.ButtonBuilder()
            .setLabel('Ok')
            .setCustomId(`automod_1_${message.id}_${message.author.id}`)
            .setDisabled(false)
            .setStyle(DiscordJS.ButtonStyle.Success),
        new DiscordJS.ButtonBuilder()
            .setLabel('Delete')
            .setCustomId(`automod_2_${message.id}_${message.author.id}_${score}`)
            .setDisabled(false)
            .setStyle(DiscordJS.ButtonStyle.Secondary),
        new DiscordJS.ButtonBuilder()
            .setLabel('Kick')
            .setCustomId(`automod_3_${message.id}_${message.author.id}_${score}`)
            .setDisabled(false)
            .setStyle(DiscordJS.ButtonStyle.Primary),
        new DiscordJS.ButtonBuilder()
            .setLabel('Ban')
            .setCustomId(`automod_4_${message.id}_${message.author.id}_${score}`)
            .setDisabled(false)
            .setStyle(DiscordJS.ButtonStyle.Danger));
    try {await channel.send({ embeds: [embed], components: [actions] })} catch {}
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
    var result = [0, []];
    keys.forEach(word => {
        if (message_content.includes(standardize_word(word))) {
            result[0] += words_list[word];
            result[1].push(word);
        }
    })
    return result;
}

exports.load = async function() {
    await user_scores.load();
    try {
        const rawdata = fs.readFileSync(file_path);
        const data = JSON.parse(rawdata);
        words_list = data;
    } catch {fs.writeFileSync(file_path, '{}', (err) => {if (err) throw err})}
}