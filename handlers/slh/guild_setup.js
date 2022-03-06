const colors = require("../../colors.json");
const types = require("../../arg_type.json");
const discord = require('discord.js')
const fs = require('fs')

var guilds_settings = {}

async function read_file() {
    const rawdata = fs.readFileSync('./config/guilds_settings.json');
    guilds_settings = JSON.parse(rawdata);
}

async function write_file() {
    const data = JSON.stringify(guilds_settings, null, 2)
    fs.writeFileSync('./config/guilds_settings.json', data, (err) => {if (err) throw err;});
}

function create_options(guild) {
    var res = []
    const options = guild.roles.cache.map(r => r.name).filter(r => r != '@everyone')
    for (i in options) res.push({ label: options[i], value: options[i], description: options[i] })
    return res
}

async function display_manager(guildId, guild) {
    try {
        await write_file()
        console.log()
        const embed = new discord.MessageEmbed().setColor(colors.cyan).setTitle('Your guild setup')
        .addField('Welcome message', guilds_settings[guildId].welcome_message ? 'Enable' : 'Disable')
        .addField('Welcome message in DMs', guilds_settings[guildId].welcome_dm ? 'Enable' : 'Disable')
        .addField('Default roles', guilds_settings[guildId].default_roles.length ? guild.roles.cache.map(r => [r.name, r.id]).filter(r => r[0] != '@everyone' && guilds_settings[guildId].default_roles.includes(r[1])).map(r => r[0]).join(', ') : 'No roles set')
        .addField('Game roles', guilds_settings[guildId].game_roles.length ? guild.roles.cache.map(r => [r.name, r.id]).filter(r => r[0] != '@everyone' && guilds_settings[guildId].game_roles.includes(r[1])).map(r => r[0]).join(', ') : 'No roles set')
        .addField('Temporary channel position', guilds_settings[guildId].temp_chan_pos.toString())
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
            name: 'temporary_channel_position',
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
                if (interaction.customId == 'setup_default') {
                    guilds_settings[guildId].default_roles = []
                    for (i in interaction.values) {
                        roleid = interaction.member.guild.roles.cache.find(r => r.name == interaction.values[i]).id
                        guilds_settings[guildId].default_roles.push(roleid)
                    }
                }
                roleid = ''
                if (interaction.customId == 'setup_games') {
                    guilds_settings[guildId].game_roles = []
                    for (i in interaction.values) {
                        roleid = interaction.member.guild.roles.cache.find(r => r.name == interaction.values[i]).id
                        guilds_settings[guildId].game_roles.push(roleid)
                    }
                }
                return display_manager(guildId, interaction.member.guild);
            }
            if (interaction.isCommand()) {
                if (!interaction.member.permissions.has('ADMINISTRATOR')) return `You don't have the permission to do that`
                await read_file()
                if (guildId in guilds_settings == false) {
                    guilds_settings[guildId] = {
                        welcome_message: true,
                        welcome_dm: true,
                        default_roles: [],
                        game_roles: [],
                        temp_chan_pos: 1,
                    }
                }
                for (i in args) {
                    var row = new discord.MessageActionRow();
                    if (args[i].name == 'temporary_channel_position') guilds_settings[guildId].temp_chan_pos = args[i].value
                    else if (args[i].name == 'welcome_message') guilds_settings[guildId].welcome_message = args[i].value
                    else if (args[i].name == 'welcome_dm') guilds_settings[guildId].welcome_dm = args[i].value
                    else if (args[i].name == 'default_roles') {
                        if (args[i].value == 'reset') {
                            guilds_settings[guildId].default_roles = []
                            guilds_settings[guildId].game_roles = []
                        } else {
                            row.addComponents(
                                new discord.MessageSelectMenu()
                                .setCustomId(`setup_${args[i].value}`)
                                .setPlaceholder('Select roles to add')
                                .setMinValues(0)
                                .addOptions(create_options(interaction.member.guild))
                            )
                            row.components[0].setMaxValues(row.components[0].options.length)
                            await write_file()
                            return {components: [row], ephemeral: true}
                        }
                    }
                }
                return display_manager(guildId, interaction.member.guild);
            }
        } catch (e) {console.log('Error in /setup:', e); return "Oups, I can't do that"}
    }
}