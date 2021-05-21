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
            const log = client.guilds.cache.get(interaction.guild_id).channels.cache.find(chan => chan.name === "🚧bot_log🚧" && chan.type === "text");
            if (!log) {return}
            log.send(`${client.user} rps <@${interaction.member.user.id}> <@${args[0]}> ${interaction.channel_id}`)
            return `Ok I'm lunching the game`
        } catch {return "Oups, I can't do that"}
    }
}