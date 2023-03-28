const guilds_settings = require('../configuration.js');
const temp_channels = require('../channels.js');
const DiscordJS = require('discord.js');

async function create_channels(guild, author, limit = null) {
    try {
        const name = author.username;
        const category = guilds_settings.get(guild.id).temp_chan_cat;
        const embed = new DiscordJS.EmbedBuilder()
        .setColor(DiscordJS.Colors.Aqua).setTimestamp()
        .setThumbnail(author.avatarURL({ dynamic: true, format: 'png', size: 128 }))
        .setTitle("Hi there!")
        .setFooter({ text: "Created" })
        .setDescription("There is your own channel!\n`Rules?`\n**Nope!** this channel is temporary.\nEverything you say here will be deleted\nwhen you all leave the channel!")
        .addFields([{name: '`Channel owner:`', value: `${author}`, inline: true}])

        const createdVoice = await guild.channels.create({
            name: `💢${name}'s💢`,
            type: DiscordJS.ChannelType.GuildVoice,
            parent: category,
            userLimit: limit,
            nsfw: true,
        }).then(channel => {return channel})
        try {await createdVoice.send({ embeds: [embed]} )} catch {}
        try {const m = await createdVoice.send({ content: `${author}` }); setTimeout(() => m.delete(), 100)} catch {}
        try {await guild.members.cache.get(author.id).voice.setChannel(createdVoice.id)} catch {}
        temp_channels.add(createdVoice.id)
        await temp_channels.save();
        return true
    } catch (e) {console.error('Error in /create normal:', e); return false}
}

async function create_private_channels(guild, author, limit = null) {
    try {
        const name = author.username;
        const category = guilds_settings.get(guild.id).temp_chan_cat;
        const embed = new DiscordJS.EmbedBuilder()
        .setColor(DiscordJS.Colors.Aqua).setTimestamp()
        .setThumbnail(author.avatarURL({ dynamic: true, format: 'png', size: 128 }))
        .setTitle("Hi there!")
        .setFooter({ text: "Created" })
        .setDescription("There is your own private channel!\n`Rules?`\n**Nope!** this channel is temporary.\nEverything you say here will be deleted\nwhen you all leave the channel!")
        .addFields([{name: '`How can you invite a user?`', value: `use \`/invite\` and choose a user or a role`}, {name: '`Channel owner:`', value: `${author}`}])

        const createdVoice = await guild.channels.create({
            name: `🔒💢${name}'s💢🔒`,
            type: DiscordJS.ChannelType.GuildVoice,
            parent: category,
            userLimit: limit,
            nsfw: true,
            permissionOverwrites: [{
                id: guild.roles.everyone,
                deny: BigInt(1024)
            }, {
                id: author.id,
                allow: BigInt(1024)
            }
        ]}).then(channel => {return channel})
        try {await createdVoice.send({ embeds: [embed]} )} catch {}
        try {const m = await createdVoice.send({ content: `${author}` }); setTimeout(() => m.delete(), 100)} catch {}
        try {await guild.members.cache.get(author.id).voice.setChannel(createdVoice.id)} catch {}
        temp_channels.add(createdVoice.id, true)
        await temp_channels.save();
        return true
    } catch (e) {console.error('Error in /create private:', e); return false}
}

module.exports = {
    test: false,
    data: new DiscordJS.SlashCommandBuilder()
        .setName('create')
        .setDescription('Create a new channel')
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('type')
            .setDescription('Create a normal or a private channel')
            .setRequired(true)
            .addChoices(
                {name: 'normal', value: 'normal'},
                {name: 'private', value: 'priv'}))
        .addIntegerOption(option => option
            .setName('limit')
            .setDescription('Set a user limit for the channel')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(99)),
    async execute({interaction, options}) {
        try {
            const data = [options[0].value, options[1] ? options[1].value : null];
            if (interaction) {
                await interaction.deferReply({ephemeral: true});
                switch (data[0]) {
                case 'normal':
                    if (await create_channels(interaction.member.guild, interaction.user, data[1])) interaction.editReply({content: 'Ok, done'})
                    else await interaction.editReply({content: `Oups, something went wrong`})
                    break;
                case 'priv':
                    if (await create_private_channels(interaction.member.guild, interaction.user, data[1])) interaction.editReply({content: 'Ok, done'})
                    else await interaction.editReply({content: `Oups, something went wrong`})
                    break;
                    default: await interaction.editReply({content: `Oups, something went wrong`})
                }
            } else {
                switch (data[0]) {
                case 'normal':
                    await create_channels(options[0].guild, options[0].user, data[1])
                    break;
                case 'priv':
                    await create_private_channels(options[0].guild, options[0].user, data[1])
                    break;
                default: throw new Error('Invalid type');
                }
            }
        } catch (e) {console.error('Error in /create:', e)}
    }
}