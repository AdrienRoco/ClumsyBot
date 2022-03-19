const guilds_settings = require('../../configuration.js');
const temp_channels = require('../../channels.js');
const colors = require("../../colors.json");
const types = require("../../arg_type.json");
const discord = require('discord.js')

async function create_channels(guild, author) {
    try {
        const name = author.username;
        var pos
        try {pos = guilds_settings.get(guild.id).temp_chan_pos} catch {pos = 1}
        var embed = new discord.MessageEmbed().setColor(colors.cyan).setTimestamp()
        .setThumbnail(author.avatarURL({ dynamic: true, format: 'png', size: 128 }))
        .setTitle("Hi there!")
        .setFooter({ text: "Created" })
        .setDescription("There is your own channel!\n`Rules?`\n**Nope!** this channel is temporary.\nEverything you say here will be deleted\nwhen you all leave the channel!")
        .addField(`\`Channel owner:\``, `${author}`)

        const createdCChannel = await guild.channels.create(`💢${name}'s channels💢`, {type: 'GUILD_CATEGORY', position: pos})
        .then(channel => {return channel})
        const createdTChannel = await guild.channels.create(`💬${name}'s💬`, {type: 'GUILD_TEXT', parent: createdCChannel.id, nsfw: true})
        .then(channel => {return channel})
        const createdVChannel = await guild.channels.create(`🔊${name}'s🔊`, {type: 'GUILD_VOICE', parent: createdCChannel.id})
        .then(channel => {return channel})
        try {await createdTChannel.send({ embeds: [embed]} )} catch {}
        try {await guild.members.cache.get(author.id).voice.setChannel(createdVChannel.id)} catch {}
        temp_channels.add(createdCChannel.id, createdTChannel.id, createdVChannel.id)
        await temp_channels.save();
        return true
    } catch (e) {console.log('Error in /create normal:', e); return false}
}

async function create_private_channels(guild, author) {
    try {
        const name = author.username;
        var pos
        try {pos = guilds_settings.get(guild.id).temp_chan_pos} catch {pos = 1}
        var embed = new discord.MessageEmbed().setColor(colors.cyan).setTimestamp()
        .setThumbnail(author.avatarURL({ dynamic: true, format: 'png', size: 128 }))
        .setTitle("Hi there!")
        .setFooter({ text: "Created" })
        .setDescription("There is your own private channel!\n`Rules?`\n**Nope!** this channel is temporary.\nEverything you say here will be deleted\nwhen you all leave the channel!")
        .addField(`\`Channel owner:\``, `${author}`)
        .addField(`\`How can you invite a user?\``, `use /invite and choose a user or a role`)

        const createdCChannel = await guild.channels.create(`🔒💢${name}'s channels💢🔒`, {type: 'GUILD_CATEGORY', position: pos, permissionOverwrites: [
            {
                id: guild.roles.everyone,
                deny: BigInt(1099511627775)
            },{
                id: author.id,
                allow: BigInt(517647748689)
            }
        ]})
        .then(channel => {return channel})
        const createdTChannel = await guild.channels.create(`🔒💬${name}'s💬🔒`, {type: 'GUILD_TEXT', parent: createdCChannel.id, nsfw: true})
        .then(channel => {return channel})
        const createdVChannel = await guild.channels.create(`🔒🔊${name}'s🔊🔒`, {type: 'GUILD_VOICE', parent: createdCChannel.id})
        .then(channel => {return channel})
        try {await createdTChannel.send({ embeds: [embed]} )} catch {}
        try {await guild.members.cache.get(author.id).voice.setChannel(createdVChannel.id)} catch {}
        temp_channels.add(createdCChannel.id, createdTChannel.id, createdVChannel.id, true)
        await temp_channels.save();
        return true
    } catch (e) {console.log('Error in /create private:', e); return false}
}

module.exports = {
    test: false,
    name: 'create',
    description: 'Create a new channel',
    args: [
        {
            name: 'type',
            description: 'Create a normal or a private channel',
            type: types.string,
            required: true,
            choices: [
                {
                    name: 'normal',
                    value: 'normal'
                },
                {
                    name: 'private',
                    value: 'priv'
                },
            ],
        },
    ],
    callback: async ({ interaction, args }) => {
        try {
            switch (args[0].value) {
                case 'normal':
                    if (await create_channels(interaction.member.guild, interaction.user)) return 'Ok, done'
                    else return `Oups, something went wrong`
                case 'priv':
                    if (await create_private_channels(interaction.member.guild, interaction.user)) return 'Ok, done'
                    else return `Oups, something went wrong`
                default: return "Oups, I can't do that"
            }
        } catch (e) {console.log('Error in /create:', e); return "Oups, I can't do that"}
    },
}