const temp_channels = require('../channels.js');
const DiscordJS = require("discord.js");

async function invite(client, interaction, mention, ping) {
    try {
        const channel = client.channels.cache.get(interaction.channelId)
        const embed = new DiscordJS.EmbedBuilder()
        .setTitle('Channel info').setColor(DiscordJS.Colors.Green).setTimestamp()
        .setThumbnail(client.users.cache.get(interaction.user.id).avatarURL({ dynamic: true, format: 'png', size: 64 }))
        .setDescription(`Fine, I will invite ${mention}🔓`)
        await channel.permissionOverwrites.edit(mention.id, {ViewChannel: true})
        if (ping) try {message = await channel.send({ content: `${mention}` }); setTimeout(() => message.delete(), 100)} catch {}
        await interaction.editReply({embeds: [embed]})
    } catch (e) {console.error('Error in /invite:', e)}
}

module.exports = {
    test: true,
    data: new DiscordJS.SlashCommandBuilder()
        .setName('invite')
        .setDescription('Invite someone in you\'r private channel')
        .setDMPermission(false)
        .addMentionableOption(option => option
            .setName('user_or_role')
            .setDescription('The user or role you want to invite')
            .setRequired(true))
        .addBooleanOption(option => option
            .setName('ping')
            .setDescription('Ping the user on invite')
            .setRequired(true)),
    async execute({client, interaction, options}) {
        try {
            await interaction.deferReply({ephemeral: true})
            if (!temp_channels.get(interaction.channelId) || !temp_channels.get(interaction.channelId).private) {await interaction.editReply({content: 'You are not in a private channel'}); return}
            await invite(client, interaction, options[0].user ? options[0].user : options[0].role, options[1].value)
        } catch (e) {console.error('Error in /invite:', e)}
    },
}