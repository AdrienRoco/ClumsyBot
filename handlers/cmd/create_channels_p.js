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
    run: async (bot, message, args) => {
        try {
            temp_cat_priv = [];
            temp_ch_priv = [];
            temp_tx_priv = [];
            await read_file()
            const author = message.mentions.users.each(user => user).filter(user => !user.bot).first()
            const name = author.username;
            var embed = new MessageEmbed().setColor(colors.cyan).setTimestamp()
            .setThumbnail(bot.users.cache.get(author.id).avatarURL({ dynamic: true, format: 'png', size: 128 }))
            .setTitle("Hi there!")
            .setFooter("Created")
            .setDescription("There is your own private channel!\n`Rules?`\n**Nope!** this channel is temporary.\nEverything you say here will be deleted\nwhen you all leave the channel!")
            .addField(`\`Channel owner:\``, `${author}`)
            .addField(`\`How can you invite a user?\``, `ex: ${bot.user}\`invite @user_or_role\`\n\n(The / version is comming soon)`)

            await message.guild.channels.create(`🔒💢${name}'s channels💢🔒`, {type: 'category', position: 1, permissionOverwrites: [
                {id: message.guild.roles.everyone, deny: 8589934591},
                {id: author.id, allow: 2184564288}
            ]})
            .then(async createdcat => {
                await message.guild.channels.create(`🔒🔊${name}'s🔊🔒`, {type: 'voice', parent: createdcat.id})
                .then(async createdVChannel => {
                    temp_ch_priv.push({id: createdVChannel.id});
                    try {await message.guild.members.cache.get(author.id).voice.setChannel(createdVChannel.id)}
                    catch {}
                })
                await message.guild.channels.create(`🔒💬${name}'s💬🔒`, {type: 'text', parent: createdcat.id, nsfw: true})
                .then(async createdTChannel => {
                    temp_tx_priv.push({id: createdTChannel.id});
                    bot.channels.cache.get(createdTChannel.id).send(embed)
                })
                temp_cat_priv.push({ id: createdcat.id})
            })
            await write_file()
        } catch {return}
    }
}