const guilds_settings = require('../../configuration.js');
const colors = require("../../colors.json");
const types = require("../../arg_type.json");
const discord = require('discord.js')

function create_options(guild) {
    var res = []
    const options = guild.roles.cache.map(r => r.name).filter(r => r != '@everyone')
    for (i in options) res.push({ label: options[i], value: options[i], description: options[i] })
    return res
}

async function display_manager(guildId, guild) {
    try {
        const embed = new discord.MessageEmbed().setColor(colors.cyan).setTitle('Your guild setup')
        .addField('Welcome message', guilds_settings.get(guildId).welcome_message ? 'Enable' : 'Disable')
        .addField('Welcome message in DMs', guilds_settings.get(guildId).welcome_dm ? 'Enable' : 'Disable')
        .addField('Default roles', guilds_settings.get(guildId).default_roles.length ? guild.roles.cache.map(r => [r.name, r.id]).filter(r => r[0] != '@everyone' && guilds_settings.get(guildId).default_roles.includes(r[1])).map(r => r[0]).join(', ') : 'No roles set')
        .addField('Game roles', guilds_settings.get(guildId).game_roles.length ? guild.roles.cache.map(r => [r.name, r.id]).filter(r => r[0] != '@everyone' && guilds_settings.get(guildId).game_roles.includes(r[1])).map(r => r[0]).join(', ') : 'No roles set')
        .addField('Temporary channel position', guilds_settings.get(guildId).temp_chan_pos.toString())
        return {embeds: [embed], ephemeral: true}
    } catch (e) {console.log('Error in /setup display:', e); return "Oups, I can't do that"}
}

module.exports = {
    test: false,
    name: 'setup',
    description: 'Setup the bot for your guild',
    args: [
        {
            name: 'welcome_message',
            description: 'Do you want to send a welcome message?, default: true',
            type: types.bool,
            required: false,
        },
        {
            name: 'welcome_dm',
            description: 'Do you want to send a welcome message in DMs?, default: true',
            type: types.bool,
            required: false,
        },
        {
            name: 'default_roles',
            description: 'do you want to choose the default roles?, default: false',
            type: types.string,
            required: false,
            choices: [
                {
                    name: 'Default roles',
                    value: 'default',
                },
                {
                    name: 'Games roles',
                    value: 'games',
                },
                {
                    name: 'reset',
                    value: 'reset',
                },
            ],
        },
        {
            name: 'temp_chan_pos',
            description: 'The position of the temporary channel, default: 1',
            type: types.int,
            required: false,
        },
    ],
    callback: async ({ interaction, args }) => {
        try {
            const guildId = interaction.guildId.toString()
            if (interaction.isSelectMenu()) {
                var roleid = ''
                var list = []
                if (interaction.customId == 'setup_default') {
                    list = guilds_settings.get(guildId).default_roles
                    for (i in interaction.values) {
                        roleid = interaction.member.guild.roles.cache.find(r => r.name == interaction.values[i]).id
                        list.push(roleid)
                    }
                    guilds_settings.modify(guildId, 'default_roles', list)
                }
                roleid = ''
                list = []
                if (interaction.customId == 'setup_games') {
                    list = guilds_settings.get(guildId).game_roles
                    for (i in interaction.values) {
                        roleid = interaction.member.guild.roles.cache.find(r => r.name == interaction.values[i]).id
                        list.push(roleid)
                    }
                    guilds_settings.modify(guildId, 'game_roles', list)
                }
                await guilds_settings.save()
                return display_manager(guildId, interaction.member.guild);
            }
            if (interaction.isCommand()) {
                if (!interaction.member.permissions.has('ADMINISTRATOR')) return `You don't have the permission to do that`
                if (guildId in guilds_settings.get() == false) {guilds_settings.set(guildId); await guilds_settings.save()}
                var row = new discord.MessageActionRow();
                var roles = false
                for (i in args) {
                    if (args[i].name == 'default_roles') {
                        if (args[i].value == 'reset') {
                            guilds_settings.modify(guildId, 'default_roles', [])
                            guilds_settings.modify(guildId, 'game_roles', [])
                        } else {
                            row.addComponents(
                                new discord.MessageSelectMenu()
                                .setCustomId(`setup_${args[i].value}`)
                                .setPlaceholder('Select roles to add')
                                .setMinValues(0)
                                .addOptions(create_options(interaction.member.guild))
                            )
                            row.components[0].setMaxValues(row.components[0].options.length)
                            roles = true
                        }
                    } else guilds_settings.modify(guildId, args[i].name, args[i].value)
                }
                await guilds_settings.save()
                if (roles) return {components: [row], ephemeral: true}
                return display_manager(guildId, interaction.member.guild);
            }
        } catch (e) {console.log('Error in /setup:', e); return "Oups, I can't do that"}
    }
}