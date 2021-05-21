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

function user_is_in_private(client, mention) {
    if (temp_ch_priv.length <= 0) return false;
    for (let i = 0; i < temp_ch_priv.length; i++) {
        const ch = client.channels.cache.get(temp_ch_priv[i].id)
        const mem = ch.members.array()
        for (let j = 0; j < ch.members.size; j++) {
            if (mem[j].id === mention.id) return i + 1;
        }
    }
    return false;
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
            required: true,
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
            if (!user_is_in_private(client, interaction.member.user)) {return `You must be in a private chanel`}
            const log = client.guilds.cache.get(interaction.guild_id).channels.cache.find(chan => chan.name === "🚧bot_log🚧" && chan.type === "text");
            if (!log) {return}
            for (i in args) {log.send(`${client.user} invite <@${interaction.member.user.id}> ${args[i]}`)}
            return `Let's go`
        } catch {"Oups, I can't do that"}
    },
}