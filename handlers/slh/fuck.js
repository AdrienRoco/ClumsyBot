const colors = require("../../colors.json");
const types = require("../../arg_type.json");
const discord = require('discord.js')

module.exports = {
    test: false,
    name: 'fuck',
    description: 'Tell someone to go fuck himself',
    args: [
        {
            name: 'user',
            description: 'A user',
            type: types.user,
            required: false,
        },
    ],
    callback: async ({ args }) => {
        try {
            const embed = new discord.MessageEmbed()
            .setTitle('Fuck you')
            .setColor(colors.red)
            if (args[0]) embed.setDescription(`${args[0].member}`)
            else embed.setTitle("Then go fuck yourself")
            return {embeds: [embed]};
        } catch (e) {console.log('Error in /fuck:', e); return "Oups, I can't do that"}
    }
}