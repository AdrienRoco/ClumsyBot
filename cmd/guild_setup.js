const guilds_settings = require('../configuration.js');
const DiscordJS = require('discord.js')

function create_options(guild) {
    var result = []
    const options = guild.roles.cache.map(r => r.name).filter(r => r != '@everyone')
    for (i in options) result.push({ label: options[i], value: options[i], description: options[i] })
    return result
}

async function display_manager(guildId, guild) {
    try {
        const embed = new DiscordJS.EmbedBuilder().setColor(DiscordJS.Colors.DarkBlue).setTitle('Your guild setup')
        .addFields([
            { name: 'Welcome message', value: guilds_settings.get(guildId).welcome_message ? 'Enable' : 'Disable' },
            { name: 'Default roles', value: guilds_settings.get(guildId).default_roles.length ? guild.roles.cache.map(r => [r.name, r.id]).filter(r => r[0] != '@everyone' && guilds_settings.get(guildId).default_roles.includes(r[1])).map(r => r[0]).join(', ') : 'No roles set' },
            { name: 'Temporary channels category', value: guilds_settings.get(guildId).temp_chan_cat ? guild.channels.cache.get(guilds_settings.get(guildId).temp_chan_cat).name : 'No category set' },
            { name: 'Temporary channels creation channel', value: guilds_settings.get(guildId).temp_chan_create ? guild.channels.cache.get(guilds_settings.get(guildId).temp_chan_create).name : 'No channel set' },
            { name: 'Temporary private channels creation channel', value: guilds_settings.get(guildId).temp_priv_create ? guild.channels.cache.get(guilds_settings.get(guildId).temp_priv_create).name : 'No channel set' }
        ])
        return embed
    } catch (e) {console.error('Error in /setup display:', e)}
}

module.exports = {
    test: false,
    data: new DiscordJS.SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup the bot for your guild')
        .setDMPermission(false)
        .addBooleanOption(option => option
            .setName('welcome_message')
            .setDescription('Do you want to send a welcome message?')
            .setRequired(false))
        .addStringOption(option => option
            .setName('default_roles')
            .setDescription('Do you want to setup the default roles?')
            .setRequired(false)
            .addChoices(
                {name: 'Add roles', value: 'add'},
                {name: 'Clear roles', value: 'clear'}))
        .addChannelOption(option => option
            .setName('temp_chan_cat')
            .setDescription('The category for the temporary channels')
            .setRequired(false))
        .addChannelOption(option => option
            .setName('temp_chan_create')
            .setDescription('The channel for the temporary channels creation')
            .setRequired(false))
        .addChannelOption(option => option
            .setName('temp_priv_create')
            .setDescription('The channel for the temporary private channels creation')
            .setRequired(false))
        .addBooleanOption(option => option
            .setName('reset_temp_chan')
            .setDescription('Reset the temporary channels settings?')
            .setRequired(false))
        .setDefaultMemberPermissions(DiscordJS.PermissionFlagsBits.Administrator),
    async execute({client, interaction, options}) {
        try {
            const guildId = interaction.guildId
            if (interaction.isCommand()) {
                await interaction.deferReply({ephemeral: true})
                if (guilds_settings.get(guildId) == undefined) {guilds_settings.set(guildId); await guilds_settings.save()}
                for (element in options) {
                    if (options[element]["name"] == "welcome_message") guilds_settings.modify(guildId, "welcome_message", options[element]["value"])
                    if (options[element]["name"] == "temp_chan_cat") guilds_settings.modify(guildId, "temp_chan_cat", options[element]["value"])
                    if (options[element]["name"] == "temp_chan_create") guilds_settings.modify(guildId, "temp_chan_create", options[element]["value"])
                    if (options[element]["name"] == "temp_priv_create") guilds_settings.modify(guildId, "temp_priv_create", options[element]["value"])
                    if (options[element]["name"] == "reset_temp_chan") {guilds_settings.modify(guildId, "temp_chan_cat", null); guilds_settings.modify(guildId, "temp_chan_create", null); guilds_settings.modify(guildId, "temp_priv_create", null)}
                    if (options[element]["name"] == "default_roles") {
                        if (options[element]["value"] == "clear") guilds_settings.modify(guildId, "default_roles", [])
                        if (options[element]["value"] == "add") {
                            client.CacheInteractions.set(interaction.id, interaction)
                            const row = new DiscordJS.ActionRowBuilder()
                            .addComponents(
                                new DiscordJS.StringSelectMenuBuilder()
                                    .setCustomId(`setup_${options[element]["value"]}`)
                                    .setPlaceholder('Select roles to add')
                                    .setMinValues(0)
                                    .addOptions(create_options(interaction.guild))
                            )
                            row.components[0].setMaxValues(row.components[0].options.length)
                            await interaction.editReply({components: [row]})
                        }
                    }
                }
                await guilds_settings.save()
                await interaction.editReply({embeds: [await display_manager(guildId, interaction.guild)]})
            } else if (interaction.isStringSelectMenu()) {
                await interaction.deferReply({ephemeral: true})
                await client.CacheInteractions.get(interaction.message.interaction.id).editReply({components: []})
                let role_list = guilds_settings.get(guildId).default_roles
                for (i in interaction.values) {
                    role_id = interaction.member.guild.roles.cache.find(r => r.name == interaction.values[i]).id;
                    role_list.push(role_id);
                }
                guilds_settings.modify(guildId, 'default_roles', role_list)
                await guilds_settings.save()
                await interaction.deleteReply()
                await client.CacheInteractions.get(interaction.message.interaction.id).editReply({embeds: [await display_manager(guildId, interaction.guild)]})
                await client.CacheInteractions.delete(interaction.message.interaction.id)
            }
        } catch (e) {console.error('Error in /setup:', e)}
    }
}