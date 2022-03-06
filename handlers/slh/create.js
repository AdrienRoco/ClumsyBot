const colors = require("../../colors.json");
const types = require("../../arg_type.json");
const discord = require('discord.js')
const fs = require("fs");

var temp_cat = [];
var temp_ch = [];
var temp_tx = [];
var temp_cat_priv = [];
var temp_ch_priv = [];
var temp_tx_priv = [];

var guilds_settings = {}

async function read_conf() {
    const rawdata = fs.readFileSync('./config/guilds_settings.json');
    const conf = JSON.parse(rawdata);
    return conf;
}

async function read_file() {
    const rawdata = fs.readFileSync('./config/temp_ids.json');
    const ids = JSON.parse(rawdata);
    for (let i = 0; i < ids.temp_cat.length; i++) {
        temp_cat.push(ids.temp_cat[i]);
        temp_ch.push(ids.temp_ch[i]);
        temp_tx.push(ids.temp_tx[i]);
    }
}

async function write_file() {
    const data = JSON.stringify({temp_cat, temp_ch, temp_tx}, null, 2)
    fs.writeFileSync('./config/temp_ids.json', data, (err) => {if (err) throw err;});
}

async function read_priv_file() {
    const rawdata = fs.readFileSync('./config/temp_priv_ids.json');
    const ids = JSON.parse(rawdata);
    for (let i = 0; i < ids.temp_cat_priv.length; i++) {
        temp_cat_priv.push(ids.temp_cat_priv[i]);
        temp_ch_priv.push(ids.temp_ch_priv[i]);
        temp_tx_priv.push(ids.temp_tx_priv[i]);
    }
}
async function write_priv_file() {
    const data = JSON.stringify({temp_cat_priv, temp_ch_priv, temp_tx_priv}, null, 2)
    fs.writeFileSync('./config/temp_priv_ids.json', data, (err) => {if (err) throw err;});
}

async function create_channels(guild, author) {
    try {
        temp_cat = [];
        temp_ch = [];
        temp_tx = [];
        await read_file()
        const name = author.username;
        var pos
        try {pos = guilds_settings[guild.id].temp_chan_pos} catch {pos = 1}
        var embed = new discord.MessageEmbed().setColor(colors.cyan).setTimestamp()
        .setThumbnail(author.avatarURL({ dynamic: true, format: 'png', size: 128 }))
        .setTitle("Hi there!")
        .setFooter({ text: "Created" })
        .setDescription("There is your own channel!\n`Rules?`\n**Nope!** this channel is temporary.\nEverything you say here will be deleted\nwhen you all leave the channel!")
        .addField(`\`Channel owner:\``, `${author}`)

        await guild.channels.create(`💢${name}'s channels💢`, {type: 'GUILD_CATEGORY', position: pos})
        .then(async createdcat => {
            await guild.channels.create(`💬${name}'s💬`, {type: 'GUILD_TEXT', parent: createdcat.id, nsfw: true})
            .then(async createdTChannel => {
                temp_tx.push({id: createdTChannel.id});
                try {await createdTChannel.send({ embeds: [embed] }).catch()} catch {}
            })
            await guild.channels.create(`🔊${name}'s🔊`, {type: 'GUILD_VOICE', parent: createdcat.id})
            .then(async createdVChannel => {
                temp_ch.push({id: createdVChannel.id});
                try {await guild.members.cache.get(author.id).voice.setChannel(createdVChannel.id)}
                catch {}
            })
            temp_cat.push({ id: createdcat.id})
        })
        await write_file()
        return true
    } catch (e) {console.log('Error in /create normal:', e); return false}
}

async function create_private_channels(guild, author) {
    try {
        temp_cat_priv = [];
        temp_ch_priv = [];
        temp_tx_priv = [];
        await read_priv_file()
        const name = author.username;
        var pos
        try {pos = guilds_settings[guild.id].temp_chan_pos} catch {pos = 1}
        var embed = new discord.MessageEmbed().setColor(colors.cyan).setTimestamp()
        .setThumbnail(author.avatarURL({ dynamic: true, format: 'png', size: 128 }))
        .setTitle("Hi there!")
        .setFooter({ text: "Created" })
        .setDescription("There is your own private channel!\n`Rules?`\n**Nope!** this channel is temporary.\nEverything you say here will be deleted\nwhen you all leave the channel!")
        .addField(`\`Channel owner:\``, `${author}`)
        .addField(`\`How can you invite a user?\``, `use /invite and choose a user or a role`)

        await guild.channels.create(`🔒💢${name}'s channels💢🔒`, {type: 'GUILD_CATEGORY', position: pos, permissionOverwrites: [
            {id: guild.roles.everyone, deny: BigInt(1099511627775)},
            {id: author.id, allow: BigInt(517647748673)}
        ]})
        .then(async createdcat => {
            await guild.channels.create(`🔒💬${name}'s💬🔒`, {type: 'GUILD_TEXT', parent: createdcat.id, nsfw: true})
            .then(async createdTChannel => {
                temp_tx_priv.push({id: createdTChannel.id});
                try {await createdTChannel.send({ embeds: [embed] }).catch()} catch {}
            })
            await guild.channels.create(`🔒🔊${name}'s🔊🔒`, {type: 'GUILD_VOICE', parent: createdcat.id})
            .then(async createdVChannel => {
                temp_ch_priv.push({id: createdVChannel.id});
                try {await guild.members.cache.get(author.id).voice.setChannel(createdVChannel.id)}
                catch {}
            })
            temp_cat_priv.push({ id: createdcat.id})
        })
        await write_priv_file()
        return true
    } catch (e) {console.log('Error in /create private:', e); return false}
}

module.exports = {
    test: false,
    name: 'create',
    description: 'Create a new channel',
    args: [
        {
            name: 'type',
            description: 'Create a normal or a private channel',
            type: types.string,
            required: true,
            choices: [
                {
                    name: 'normal',
                    value: 'normal'
                },
                {
                    name: 'private',
                    value: 'priv'
                },
            ],
        },
    ],
    callback: async ({ interaction, args }) => {
        try {
            guilds_settings = await read_conf()
            switch (args[0].value) {
                case 'normal':
                    if (await create_channels(interaction.member.guild, interaction.user)) return 'Ok, done'
                    else return `Oups, something went wrong`
                case 'priv':
                    if (await create_private_channels(interaction.member.guild, interaction.user)) return 'Ok, done'
                    else return `Oups, something went wrong`
                default: return "Oups, I can't do that"
            }
        } catch (e) {console.log('Error in /create:', e); return "Oups, I can't do that"}
    },
}