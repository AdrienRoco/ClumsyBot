const colors = require("../../colors.json");
const types = require("../../arg_type.json");

module.exports = {
    test: false,
    name: 'shifumi',
    description: 'Its a game bro',
    args: [
        {
            name: 'user',
            description: 'A user you want to play against',
            type: types.user,
            required: false,
        },
    ],
    callback: ({client, interaction, args}) => {
        try {
            try {client.botcommands.get('rps').run(client, client.guilds.cache.get(interaction.guild_id), [interaction.channel_id, interaction.member.user.id, args[0]])} catch {}
            return `Ok I'm lunching the game`
        } catch {return "Oups, I can't do that"}
    }
}