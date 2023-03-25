const temp_channels = require('../channels.js');
const DiscordJS = require('discord.js');

module.exports = {
    test: true,
    data: new DiscordJS.SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete empty temp channels')
        .setDMPermission(false)
        .setDefaultMemberPermissions(DiscordJS.PermissionFlagsBits.Administrator),
    async execute({client, interaction}) {
        try {
            if (interaction) await interaction.deferReply({ephemeral: true});
            const list = Object.keys(temp_channels.get());
            for (i in list) {
                const Channel = client.channels.cache.get(list[i])
                if (Channel && Channel.members.size == 0) {
                    try {await Channel.delete();} catch {}
                    temp_channels.remove(list[i]);
                } else if (!Channel) {
                    try {await Channel.delete();} catch {}
                    temp_channels.remove(list[i]);
                }
            }
            await temp_channels.save();
            if (interaction) await interaction.editReply({content: 'Done!'});
        } catch (e) {console.error('Error in /delete:', e)}
    }
}