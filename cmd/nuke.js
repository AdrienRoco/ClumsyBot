const DiscordJS = require('discord.js');

module.exports = {
    test: false,
    data: new DiscordJS.SlashCommandBuilder()
        .setName('nuke')
        .setDescription('Delete multiple messages')
        .setDMPermission(false)
        .addIntegerOption(option => option
            .setName('number')
            .setDescription('How many you want to nuke')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(100))
        .setDefaultMemberPermissions(DiscordJS.PermissionFlagsBits.ManageMessages),
    async execute({interaction, options}) {
        try {
            let number = options[0] ? options[0].value : 100;
            await interaction.member.guild.channels.cache.get(interaction.channelId).bulkDelete(number, true)
            .then(async del => await interaction.reply({content: `I deleted ${del.size} messages.`, ephemeral: true}));
        } catch (e) {console.error('Error in /nuke:', e)}
    }
}