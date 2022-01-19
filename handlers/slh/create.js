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
            ],
        },
    ],
    callback: ({ client, interaction, args }) => {
        try {
            switch (args[0]) {
                case 'normal':
                    try {client.botcommands.get('create_channels').run(client, client.guilds.cache.get(interaction.guild_id), [interaction.member.user.id])} catch {}
                    return `Ok, let's go`
                case 'priv':
                    try {client.botcommands.get('create_channels_p').run(client, client.guilds.cache.get(interaction.guild_id), [interaction.member.user.id])} catch {}
                    return `Ok, let's go`
                default: return "Oups, I can't do that"
            }
        } catch {return "Oups, I can't do that"}
    },
}