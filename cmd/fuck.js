const DiscordJS = require('discord.js');

module.exports = {
    test: false,
    data: new DiscordJS.SlashCommandBuilder()
        .setName('fuck')
        .setDescription('Tell someone to go fuck himself')
        .setDMPermission(false)
        .addUserOption(option => option
            .setName('who')
            .setDescription('who should go fuck himself')
            .setRequired(false)),
    async execute({interaction, options}) {
        try {
            await interaction.deferReply()
            const embed = new DiscordJS.EmbedBuilder()
            .setTitle('Fuck you')
            .setColor(DiscordJS.Colors.Red)
            if (options[0]) embed.setDescription(`${options[0].member}`)
            else embed.setTitle("Then go fuck yourself")
            await interaction.editReply({embeds: [embed]});
        } catch (e) {console.error('Error in /fuck:', e)}
    }
}