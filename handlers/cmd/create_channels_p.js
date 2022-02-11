const { MessageEmbed } = require("discord.js");
const colors = require("../../colors.json");
const fs = require("fs");

var temp_cat_priv = [];
var temp_ch_priv = [];
var temp_tx_priv = [];

async function read_file() {
    const rawdata = fs.readFileSync('./config/temp_priv_ids.json');
    const ids = JSON.parse(rawdata);
    for (let i = 0; i < ids.temp_cat_priv.length; i++) {
        temp_cat_priv.push(ids.temp_cat_priv[i]);
        temp_ch_priv.push(ids.temp_ch_priv[i]);
        temp_tx_priv.push(ids.temp_tx_priv[i]);
    }
}

async function write_file() {
    const data = JSON.stringify({temp_cat_priv, temp_ch_priv, temp_tx_priv}, null, 2)
    fs.writeFileSync('./config/temp_priv_ids.json', data, (err) => {if (err) throw err;});
}

module.exports = {
    name: "create_channels_p",
    run: async (client, guild, args) => {
        try {
            temp_cat_priv = [];
            temp_ch_priv = [];
            temp_tx_priv = [];
            await read_file()
            const author = client.users.cache.get(args[0])
            const name = author.username;
            var pos = 1
            var embed = new MessageEmbed().setColor(colors.cyan).setTimestamp()
            .setThumbnail(author.avatarURL({ dynamic: true, format: 'png', size: 128 }))
            .setTitle("Hi there!")
            .setFooter("Created")
            .setDescription("There is your own private channel!\n`Rules?`\n**Nope!** this channel is temporary.\nEverything you say here will be deleted\nwhen you all leave the channel!")
            .addField(`\`Channel owner:\``, `${author}`)
            .addField(`\`How can you invite a user?\``, `use /invite and choose a user or a role`)

            if (guild.id == "629024878812725278") pos = 6;

            await guild.channels.create(`🔒💢${name}'s channels💢🔒`, {type: 'category', position: pos, permissionOverwrites: [
                {id: guild.roles.everyone, deny: 8589934591},
                {id: author.id, allow: 2184564288}
            ]})
            .then(async createdcat => {
                await guild.channels.create(`🔒💬${name}'s💬🔒`, {type: 'text', parent: createdcat.id, nsfw: true})
                .then(async createdTChannel => {
                    temp_tx_priv.push({id: createdTChannel.id});
                    try {await createdTChannel.send(embed).catch()} catch {}
                })
                await guild.channels.create(`🔒🔊${name}'s🔊🔒`, {type: 'voice', parent: createdcat.id})
                .then(async createdVChannel => {
                    temp_ch_priv.push({id: createdVChannel.id});
                    try {await guild.members.cache.get(author.id).voice.setChannel(createdVChannel.id)}
                    catch {}
                })
                temp_cat_priv.push({ id: createdcat.id})
            })
            await write_file()
        } catch {return}
    }
}