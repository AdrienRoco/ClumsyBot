const DiscordJS = require('discord.js');

async function role_manager(user, type, role) {
    try {
        switch (type) {
            case '1':
                await user.roles.add(role);
                return true;
            case '0':
                await user.roles.remove(role);
                return true;
            default: break}
        return false;
    } catch (e) {console.error('Error in /role_manager:', e); return false}
}

function create_buttons(rodeId) {
    return new DiscordJS.ActionRowBuilder().addComponents(
        new DiscordJS.ButtonBuilder()
            .setCustomId(`gameroles_1_${rodeId}`)
            .setLabel('Get')
            .setStyle(DiscordJS.ButtonStyle.Success),
        new DiscordJS.ButtonBuilder()
            .setCustomId(`gameroles_0_${rodeId}`)
            .setLabel('Remove')
            .setStyle(DiscordJS.ButtonStyle.Danger)
    )
}

function create_embed(role) {
    return new DiscordJS.EmbedBuilder()
        .setTitle('Game Roles')
        .setColor(role.color)
        .setFooter({text: 'Make your choice:'})
        .addFields([{name: 'Role:', value: `➡️${role}⬅️`}])
}

module.exports = {
    test: true,
    data: new DiscordJS.SlashCommandBuilder()
        .setName('game_roles')
        .setDescription('Add game role buttons to the current channel')
        .setDMPermission(false)
        .addRoleOption(option => option
            .setName('role')
            .setDescription('Role to add')
            .setRequired(true))
        .setDefaultMemberPermissions(DiscordJS.PermissionFlagsBits.ManageRoles),
    async execute({interaction, options}) {
        try {
            await interaction.deferReply({ephemeral: true})
            if (interaction.isCommand()) {
                if (options[0].role.permissions.bitfield) return await interaction.editReply({content: 'You can\'t select roles with permissions'})
                await interaction.channel.send({embeds: [create_embed(options[0].role)], components: [create_buttons(options[0].role.id)]})
                await interaction.deleteReply()
            } else if (interaction.isButton()) {
                await role_manager(interaction.member, interaction.customId.split('_')[1], interaction.guild.roles.cache.get(interaction.customId.split('_')[2])) ?
                    await interaction.editReply({content: `${parseInt(interaction.customId.split('_')[1]) ? 'Added' : 'Removed'}  ${interaction.guild.roles.cache.get(interaction.customId.split('_')[2])}`}) :
                    await interaction.editReply({content: 'Error, please ask an admin'})
            }
        } catch (e) {console.error('Error in /games:', e)}
    }
}