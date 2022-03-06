const colors = require("../../colors.json");
const types = require("../../arg_type.json");

module.exports = {
    test: false,
    name: 'nuke',
    description: 'Delete multiple messages',
    args: [
        {
            name: 'number',
            description: 'How many you want to nuke',
            type: types.int,
            required: false,
        },
    ],
    callback: async ({ interaction, args }) => {
        try {
            let number = args[0].value
            if (!number) number = 100
            if (number <= 0) return "I can't delete 0 message...";
            if (number > 100) number = 100;
            if (!interaction.member.permissions.has("MANAGE_MESSAGES")) return "You can't do that";
            return await interaction.member.guild.channels.cache.get(interaction.channelId).bulkDelete(number, true)
            .then(del => `I deleted ${del.size} messages.`);
        } catch (e) {console.log('Error in /nuke:', e); return "Oups, I can't do that"}
    },
}