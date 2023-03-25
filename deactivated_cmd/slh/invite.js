const temp_channels = require('../../channels.js');
const colors = require("../../colors.json");
const types = require("../../arg_type.json");
const discord = require("discord.js");

function chan_is_private(chanel_id) {
    const list = Object.keys(temp_channels.get());
    for (i in list)
        if (temp_channels.get(list[i]).text == chanel_id && temp_channels.get(list[i]).private) return list[i];
    return false;
}

async function invite(client, interaction, mention, ping) {
    try {
        if (!mention) {throw new Error("No mention provided!")}
        const id = chan_is_private(interaction.channelId)
        const cat = client.channels.cache.get(id)
        const text = client.channels.cache.get(temp_channels.get(id).text)
        const voic = client.channels.cache.get(temp_channels.get(id).voice)
        const embed = new discord.MessageEmbed()
        .setTitle('Channel info').setColor(colors.green).setTimestamp()
        .setThumbnail(client.users.cache.get(interaction.user.id).avatarURL({ dynamic: true, format: 'png', size: 64 }))
        .setDescription(`Fine, I will invite ${mention}🔓`)
        if (!cat || !text || !voic) return false
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
        if (ping) {
            message = await text.send({ content: `${mention}` })
            setTimeout(() => message.delete(), 100)
        }
        return embed
    } catch (e) {console.log('Error in /invite:', e); return false}
}

module.exports = {
    test: false,
    name: 'invite',
    description: 'Invite someone in you\'r private channel',
    args: [
        {
            name: 'user_or_role',
            description: 'The user or role you want to invite',
            type: types.mention,
            required: true
        },
        {
            name: 'ping',
            description: 'Ping the user on invite',
            type: types.bool,
            required: true,
        },
    ],
    callback: async ({ client, interaction, args }) => {
        try {
            if (!chan_is_private(interaction.channelId)) {return `You must be in a private chanel`}
            const res = await invite(client, interaction, args[0].user ? args[0].user : args[0].role, args[1].value)
            if (!res) {return "Oups, I can't do that"}
            return { embeds: [res] }
        } catch (e) {console.log('Error in /invite:', e); return "Oups, I can't do that"}
    },
}