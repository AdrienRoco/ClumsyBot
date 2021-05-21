const colors = require("../../colors.json");
const types = require("../../arg_type.json");

module.exports = {
    test: false,
    name: 'nuke',
    description: 'Delete multiple message',
    args: [
        {
            name: 'number',
            description: 'How many you want to nuke',
            type: types.int,
            required: true,
        },
    ],
    callback: ({ client, interaction, args }) => {
        try {
            let number = args[0]
            if (!client.guilds.cache.get(interaction.guild_id).members.cache.get(interaction.member.user.id).hasPermission("MANAGE_MESSAGES")) return "You can't do that";
            if (number <= 0) return "I can't delete 0 message...";
            if (number > 100) number = 100;
            return client.guilds.cache.get(interaction.guild_id).channels.cache.get(interaction.channel_id).bulkDelete(number, true)
            .then(del => `I deleted \`${del.size}\` messages.`);
        } catch {return "Oups, I can't do that"}
    },
}