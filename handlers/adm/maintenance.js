const { MessageEmbed } = require("discord.js");
const colors = require("../../colors.json");
const fs = require("fs");

var temp_cat = [];
var temp_ch = [];
var temp_tx = [];

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

async function create_channel(client, guild, args) {
    temp_cat = [];
    temp_ch = [];
    temp_tx = [];
    await read_file()
    const author = client.users.cache.get(args[0])
    var embed = new MessageEmbed().setColor(colors.cyan).setTimestamp()
    .setThumbnail(author.avatarURL({ dynamic: true, format: 'png', size: 128 }))
    .setTitle("Hi there!")
    .setFooter("Created")
    .setDescription("There is your own channel!\n`Rules?`\n**Nope!** this channel is temporary.\nEverything you say here will be deleted\nwhen you all leave the channel!")
    .addField(`\`Channel owner:\``, `${author}`)

    await guild.channels.create(`💢server under💢`, {type: 'category', position: 1})
    .then(async createdcat => {
        await guild.channels.create(`💬maintenance💬`, {type: 'text', parent: createdcat.id, nsfw: true})
        .then(async createdTChannel => {
            temp_tx.push({id: createdTChannel.id});
            try {await createdTChannel.send(embed).catch()} catch {}
        })
        await guild.channels.create(`🔊use this🔊`, {type: 'voice', parent: createdcat.id})
        .then(async createdVChannel => {
            temp_ch.push({id: createdVChannel.id});
            try {await guild.members.cache.get(author.id).voice.setChannel(createdVChannel.id)}
            catch {}
        })
        temp_cat.push({ id: createdcat.id})
    })
    await write_file()
}

module.exports = {
    name: "maintenance",
    run: async (client, message, args) => {
        try {
            if (!message.member.hasPermission("ADMINISTRATOR")) {return message.reply("You can't do that....").then(m => m.delete({timeout:3000}).catch())}
            const guild = message.guild
            const arg = [message.author.id]
            await create_channel(client, guild, arg)
            await create_channel(client, guild, arg)
            await create_channel(client, guild, arg)
        } catch {}
        process.exit(42)
    }
}