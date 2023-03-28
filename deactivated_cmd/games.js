const guilds_settings = require('../configuration.js');
const colors = require("../../colors.json");
const types = require("../../arg_type.json");
const discord = require("discord.js");

var roles_list = []

async function roles_manager(client, interaction) {
    try {
        var r = []
        for (i in interaction.values)
            r.push(interaction.guild.roles.cache.get(interaction.values[i]))
        if (interaction.customId.split('_')[1] === 'add')
            for (i in r) {
                if (interaction.guild.roles.cache.map(role => role).filter(role => role.tags && role.tags.botId == client.user.id)[0].rawPosition > r[i].rawPosition)
                    await interaction.member.roles.add(r[i])
            }
        else if (interaction.customId.split('_')[1] === 'remove')
            for (i in r) {
                if (interaction.guild.roles.cache.map(role => role).filter(role => role.tags && role.tags.botId == client.user.id)[0].rawPosition > r[i].rawPosition)
                    await interaction.member.roles.remove(r[i])
            }
        else return false
        return true
    } catch (e) {console.error('Error in /roles:', e); return false}
}

function create_options(list, guild) {
    res = []
    for (i in list) {
        var name = guild.roles.cache.get(list[i]).name
        res.push({ label: name, value: list[i], description: name + ' role' })
    }
    return res
}

function create_menu(add, member) {
    if (add) {
        return new discord.MessageActionRow()
        .addComponents(
            new discord.MessageSelectMenu()
            .setCustomId('games_add')
            .setPlaceholder('Select roles to add')
            .setMinValues(1)
            .addOptions(create_options(roles_list, member.guild))
        )
    } else {
        var tmp = []
        for (i in roles_list)
            if (member.roles.cache.some(role => role.id === roles_list[i]))
                tmp.push(roles_list[i])
        if (!tmp[0]) return false
        return new discord.MessageActionRow()
        .addComponents(
            new discord.MessageSelectMenu()
            .setCustomId('games_remove')
            .setPlaceholder('Select roles to remove')
            .setMinValues(1)
            .addOptions(create_options(tmp, member.guild))
        )
    }
}

module.exports = {
    test: false,
    name: 'games',
    description: 'Choose or modify your game roles',
    args: [
        {
            name: 'action',
            description: 'add or remove your game roles',
            type: types.int,
            required: true,
            choices: [
                {
                    name: 'add',
                    value: 1
                },
                {
                    name: 'remove',
                    value: 0
                },
            ],
        },
    ],
    callback: async ({ client, interaction, args }) => {
        try {
            try {roles_list = guilds_settings.get(interaction.guildId).game_roles} catch {roles_list = []}
            if (!roles_list[0]) return 'No game roles set up for this guild, ask an admin to run /setup'
            if (interaction.isSelectMenu()) {
                const res = await roles_manager(client, interaction)
                embed = new discord.MessageEmbed()
                .setTitle('Roles Manager').setThumbnail(client.users.cache.get(interaction.user.id).avatarURL({ dynamic: true, format: 'png', size: 64 }))
                if (res) {
                    embed
                    .setColor(colors.green)
                    .setDescription(`Your roles have been updated!`)
                    return { embeds: [embed], ephemeral: true }
                }
                if (!res) {
                    embed
                    .setColor(colors.red)
                    .setDescription(`Something went wrong!\nAsk an admin if you think this is a bug.`)
                    return { embeds: [embed], ephemeral: true }
                }
            }
            if (interaction.isCommand()) {
                const row = create_menu(args[0].value, interaction.member)
                if (!row) return 'You don\'t have any game roles'
                row.components[0].setMaxValues(row.components[0].options.length)
                return {content: `${args[0].value ? 'Add' : 'Remove'} your roles`, components: [row], ephemeral: true};
            }
            throw new Error('Unhandled response type')
        } catch (e) {console.error('Error in /games:', e); return "Oups, I can't do that"}
    },
}