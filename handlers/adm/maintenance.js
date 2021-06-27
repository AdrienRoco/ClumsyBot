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

async function create_channel(client, guild) {
    temp_cat = [];
    temp_ch = [];
    temp_tx = [];
    await read_file()
    var embed = new MessageEmbed().setColor(colors.cyan).setTimestamp()
    .setThumbnail(client.user.avatarURL({ dynamic: true, format: 'png', size: 128 }))
    .setTitle("Hi there!")
    .setFooter("Created")
    .setDescription("There is your own channel!\n`Rules?`\n**Nope!** this channel is temporary.\nEverything you say here will be deleted\nwhen you all leave the channel!")
    .addField(`\`Channel owner:\``, `${client.user}`)

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
        })
        temp_cat.push({ id: createdcat.id})
    })
    await write_file()
}

function isInt(value) {
    return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
}

module.exports = {
    name: "maintenance",
    run: async (client, message, args) => {
        try {
            if (!message.member.hasPermission("ADMINISTRATOR")) {return message.reply("You can't do that....").then(m => m.delete({timeout:3000}).catch())}
            const guild = message.guild
            let num
            if (!args[0] || args[0] == '0') {num = 3}
            else if (!isInt(args)) {num = 3}
            else num = args[0]
            for (i = 0; i < num; i++) {
                await create_channel(client, guild)
            }
        } catch {}
        process.exit(42)
    }
}