const { MessageEmbed } = require("discord.js");
const colors = require("../../colors.json");
const fs = require("fs");

var temp_cat_priv = [];
var temp_ch_priv = [];
var temp_tx_priv = [];

async function read_file() {
    let rawdata = fs.readFileSync('./config/temp_priv_ids.json');
    let ids = JSON.parse(rawdata);
    for (let i = 0; i < ids.temp_cat_priv.length; i++) {
        temp_cat_priv.push(ids.temp_cat_priv[i]);
        temp_ch_priv.push(ids.temp_ch_priv[i]);
        temp_tx_priv.push(ids.temp_tx_priv[i]);
    }
}

function user_is_in_private(guild, mention) {
    if (temp_ch_priv.length <= 0) return false;
    for (let i = 0; i < temp_ch_priv.length; i++) {
        const ch = guild.channels.cache.get(temp_ch_priv[i].id)
        const mem = ch.members.array()
        for (let j = 0; j < ch.members.size; j++) {
            if (mem[j].id === mention.id) return i + 1;
        }
    }
    return false;
}

module.exports = {
    name: "invite",
    run: async (bot, message, args) => {
        try {
            temp_cat_priv = [];
            temp_ch_priv = [];
            temp_tx_priv = [];
            await read_file()
            const user = bot.users.cache.get(args[0])
            let mention = message.guild.members.cache.get(args[1])
            if (!mention) mention = message.guild.roles.cache.get(args[1])
            if (!mention) {return}
            const i = user_is_in_private(message.guild, user) - 1
            const embed = new MessageEmbed()
            .setTitle('Channel info').setColor(colors.green).setTimestamp()
            .setThumbnail(bot.users.cache.get(user.id).avatarURL({ dynamic: true, format: 'png', size: 32 }))
            .setDescription(`Fine, I will invite ${mention}🔓`)
            const cat = bot.channels.cache.get(temp_cat_priv[i].id)
            const text = bot.channels.cache.get(temp_tx_priv[i].id)
            if (!cat || !text) {return}
            text.send(embed)
            cat.updateOverwrite(mention, {
                'VIEW_CHANNEL': true,
                'SEND_MESSAGES': true,
                'EMBED_LINKS': true,
                'ATTACH_FILES': true,
                'ADD_REACTIONS': true,
                'USE_EXTERNAL_EMOJIS': true,
                'READ_MESSAGE_HISTORY': true,
                'USE_SLASH_COMMANDS': true,
                'CONNECT': true,
                'SPEAK': true,
                'STREAM': true,
                'USE_VAD': true,
            })
        } catch {return}
    }
}