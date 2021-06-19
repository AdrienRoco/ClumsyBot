const { MessageEmbed } = require("discord.js");
const colors = require("../../colors.json");
const types = require("../../arg_type.json");
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

function user_is_in_private(client, userid) {
    if (temp_ch_priv.length <= 0) return false;
    for (let i = 0; i < temp_ch_priv.length; i++) {
        const ch = client.channels.cache.get(temp_ch_priv[i].id)
        const mem = ch.members.array()
        for (let j = 0; j < ch.members.size; j++) {
            if (mem[j].id === userid) return i + 1;
        }
    }
    return false;
}

async function invite(userid, mention, guild, client) {
    try {
        if (!mention) {return}
        const i = user_is_in_private(guild, userid) - 1
        const embed = new MessageEmbed()
        .setTitle('Channel info').setColor(colors.green).setTimestamp()
        .setThumbnail(client.users.cache.get(userid).avatarURL({ dynamic: true, format: 'png', size: 32 }))
        .setDescription(`Fine, I will invite ${mention}🔓`)
        const cat = client.channels.cache.get(temp_cat_priv[i].id)
        const text = client.channels.cache.get(temp_tx_priv[i].id)
        const voic = client.channels.cache.get(temp_ch_priv[i].id)
        if (!cat || !text || !voic) {return}
        try {guild.members.cache.get(mention).voice.setChannel(voic)} catch {}
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

module.exports = {
    test: true,
    name: 'invite',
    description: 'Invite someone in you\'r private channel',
    args: [
        {
            name: 'user',
            description: 'A user you want to invite',
            type: types.user,
            required: false,
        },
        {
            name: 'role',
            description: 'A role you want to invite',
            type: types.role,
            required: false,
        },
    ],
    callback: async ({ client, interaction, args }) => {
        try {
            temp_cat_priv = [];
            temp_ch_priv = [];
            temp_tx_priv = [];
            await read_file()
            if (!user_is_in_private(client, interaction.member.user.id)) {return `You must be in a private chanel`}
            if (!args[0]) {return "You must select a user and/or a role"}

            let mention; let role;
            const userid = interaction.member.user.id
            const guild = client.guilds.cache.get(interaction.guild_id)

            if (args.length == 1) {
                try {mention = guild.members.cache.get(args[0])} catch {}
                try {role = guild.roles.cache.get(args[0])} catch {}
            } else {
                try {mention = guild.members.cache.get(args[0])} catch {}
                try {role = guild.roles.cache.get(args[1])} catch {}
            }
            if (mention) {await invite(userid, mention, guild, client)}
            if (role) {await invite(userid, role, guild, client)}
            return `Let's go`
        } catch {"Oups, I can't do that"}
    },
}