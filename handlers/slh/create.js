const colors = require("../../colors.json");
const types = require("../../arg_type.json");

module.exports = {
    test: false,
    name: 'create',
    description: 'Create a new channel',
    args: [
        {
            name: 'type',
            description: 'Create a normal or a private channel',
            type: types.string,
            required: true,
            choices: [
                {
                    name: 'normal',
                    value: 'false'
                },
                {
                    name: 'private',
                    value: 'true'
                }
            ],
        },
    ],
    callback: ({ client, interaction, args }) => {
        try {
            const log = client.guilds.cache.get(interaction.guild_id).channels.cache.find(chan => chan.name === "🚧bot_log🚧" && chan.type === "text");
            if (!log) {return}
            if (args[0] == 'true') {
                log.send(`${client.user} create_channels_p <@${interaction.member.user.id}>`)
                return `Ok, let's go`
            }
            log.send(`${client.user} create_channels <@${interaction.member.user.id}>`)
            return `Ok, let's go`
        } catch {return "Oups, I can't do that"}
    },
}