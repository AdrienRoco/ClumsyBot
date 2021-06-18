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
                    value: 'normal'
                },
                {
                    name: 'private',
                    value: 'priv'
                },
                {
                    name: 'amongus',
                    value: 'amongus'
                },
            ],
        },
    ],
    callback: ({ client, interaction, args }) => {
        try {
            const log = client.guilds.cache.get(interaction.guild_id).channels.cache.find(chan => chan.name === "🚧bot_log🚧" && chan.type === "text");
            if (!log) {return}
            switch (args[0]) {
                case 'normal':
                    log.send(`${client.user} create_channels ${interaction.member.user.id}`)
                    return `Ok, let's go`
                case 'priv':
                    log.send(`${client.user} create_channels_p ${interaction.member.user.id}`)
                    return `Ok, let's go`
                case 'amongus':
                    log.send(`${client.user} create_channels_a ${interaction.member.user.id}`)
                    return `Ok, let's go`
                default: return "Oups, I can't do that"
            }
        } catch {return "Oups, I can't do that"}
    },
}