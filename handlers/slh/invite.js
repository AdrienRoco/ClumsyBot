const colors = require("../../colors.json");
const types = require("../../arg_type.json");
const discord = require("discord.js");
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

function chan_is_private(chanel_id) {
    if (temp_tx_priv.length <= 0) return false;
    for (i in temp_tx_priv) if (temp_tx_priv[i].id == chanel_id) return i + 1;
    return false;
}

async function invite(client, interaction, mention) {
    try {
        if (!mention) {throw new Error("No mention provided!")}
        const i = chan_is_private(interaction.channelId) - 1
        const cat = client.channels.cache.get(temp_cat_priv[i].id)
        const text = client.channels.cache.get(temp_tx_priv[i].id)
        const voic = client.channels.cache.get(temp_ch_priv[i].id)
        const embed = new discord.MessageEmbed()
        .setTitle('Channel info').setColor(colors.green).setTimestamp()
        .setThumbnail(client.users.cache.get(interaction.user.id).avatarURL({ dynamic: true, format: 'png', size: 64 }))
        .setDescription(`Fine, I will invite ${mention}🔓`)
        if (!cat || !text || !voic) {throw new Error("Channel not found")}
        await cat.permissionOverwrites.edit(mention, {
            VIEW_CHANNEL: true,
            CREATE_INSTANT_INVITE: true,
            CHANGE_NICKNAME: true,
            SEND_MESSAGES: true,
            SEND_MESSAGES_IN_THREADS: true,
            CREATE_PUBLIC_THREADS: true,
            CREATE_PRIVATE_THREADS: true,
            EMBED_LINKS: true,
            ATTACH_FILES: true,
            ADD_REACTIONS: true,
            USE_EXTERNAL_EMOJIS: true,
            USE_EXTERNAL_STICKERS: true,
            READ_MESSAGE_HISTORY: true,
            USE_APPLICATION_COMMANDS: true,
            CONNECT: true,
            SPEAK: true,
            STREAM: true,
            USE_VAD: true,
        })
        return embed
    } catch (e) {console.log('Error in /invite:', e); return}
}

module.exports = {
    test: false,
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
            if (!chan_is_private(interaction.channelId)) {return `You must be in a private chanel`}
            if (!args[0]) {return "You must select a user and/or a role"}

            let mention; let role;
            for (i in args) {
                if (args[i].type == 'USER') mention = args[i].member
                else if (args[i].type == 'ROLE') role = args[i].role
            }
            embed_list = []
            if (!mention && !role) {return "You must select a user and/or a role"}
            if (mention) {embed_list.push(await invite(client, interaction, mention))}
            if (role) {embed_list.push(await invite(client, interaction, role))}
            return { embeds: embed_list }
        } catch (e) {console.log('Error in /invite:', e); return "Oups, I can't do that"}
    },
}