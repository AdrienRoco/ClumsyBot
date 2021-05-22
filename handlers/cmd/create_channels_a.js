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

module.exports = {
    name: "create_channels_a",
    run: async (bot, message, args) => {
        try {
            temp_cat = [];
            temp_ch = [];
            temp_tx = [];
            await read_file()
            const author = bot.users.cache.get(args[0])
            var embed = new MessageEmbed().setColor(colors.cyan).setTimestamp()
            .setThumbnail(author.avatarURL({ dynamic: true, format: 'png', size: 128 }))
            .setTitle("Hi there!")
            .setFooter("Created")
            .setDescription("There is your own channel!\n`Rules?`\n**Nope!** this channel is temporary.\nEverything you say here will be deleted\nwhen you all leave the channel!")
            .addField(`\`Channel owner:\``, `${author}`)
            const mira = new MessageEmbed()
            .setColor(colors.purple)
            .setTitle('Mira')
            .attachFiles('./img/amongus/mira.png')
            .setImage('attachment://mira.png');
            const polus = new MessageEmbed()
            .setColor(colors.purple)
            .setTitle('Polus')
            .attachFiles('./img/amongus/polus.png')
            .setImage('attachment://polus.png');
            const skeld = new MessageEmbed()
            .setColor(colors.purple)
            .setTitle('Skeld')
            .attachFiles('./img/amongus/skeld.png')
            .setImage('attachment://skeld.png');
            await message.guild.channels.create(`👻Among Us👻`, {type: 'category', position: 1})
            .then(async createdcat => {
                await message.guild.channels.create(`👻Voice👻`, {type: 'voice', parent: createdcat.id, userLimit: 10})
                .then(async createdVChannel => {
                    temp_ch.push({id: createdVChannel.id});
                    try {await message.guild.members.cache.get(author.id).voice.setChannel(createdVChannel.id)}
                    catch {}
                })
                await message.guild.channels.create(`👻Text👻`, {type: 'text', parent: createdcat.id, nsfw: true})
                .then(async createdTChannel => {
                    temp_tx.push({id: createdTChannel.id});
                    createdTChannel.send(embed)
                    createdTChannel.send(mira)
                    createdTChannel.send(polus)
                    createdTChannel.send(skeld)
                })
                temp_cat.push({ id: createdcat.id})
            })
            await write_file()
        } catch {return}
    }
}