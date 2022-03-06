const colors = require("../../colors.json");
const types = require("../../arg_type.json");
const discord = require("discord.js");

function get_result(p1, p2) {
    if (p1 == '👊' && p2 == '✌' || p1 == '✌' && p2 == '✋' || p1 == '✋' && p2 == '👊') {return 'p1'}
    if (p1 == '👊' && p2 == '✋' || p1 == '✌' && p2 == '👊' || p1 == '✋' && p2 == '✌') {return 'p2'}
    if (p1 == '👊' && p2 == '👊' || p1 == '✌' && p2 == '✌' || p1 == '✋' && p2 == '✋') {return 'draw'}
}

async function solo_game(client, interaction, game_interaction, p1) {
    await interaction.deleteReply()
    possibilty = ['👊', '✋', '✌'];
    p2 = possibilty[Math.floor(Math.random() * possibilty.length)];
    var result = await get_result(p1, p2);
    var embed = interaction.message.embeds[0]
    if (result != 'draw') {
        embed.setColor(result == 'p1' ? colors.green : colors.red ).addField(result == 'p1' ? 'You won!' : 'You lost!', `${p1} vs ${p2}`).setFooter({ text: ""})
        await game_interaction.editReply({ embeds: [embed], components: [] })
        client.shifumiinteraction.delete(game_interaction.id)
    } else {
        embed.setColor(colors.yellow).addField('It\'s a tie!', `${p1} vs ${p2}`)
        await game_interaction.editReply({ embeds: [embed] })
    }
    return true
}

async function multi_game(client, interaction, game_interaction, p1, p2) {
    await interaction.deleteReply()
    var result = await get_result(p1, p2);
    var embed = interaction.message.embeds[0]
    if (result != 'draw') {
        embed.setColor(colors.green).addField(result == 'p1' ? `${game_interaction.user.username} won!` : `${game_interaction.options._hoistedOptions[0].user.username} won!`, `${p1} vs ${p2}`).setFooter({ text: ""})
        await game_interaction.editReply({ embeds: [embed], components: [] })
        client.shifumiinteraction.delete(game_interaction.id)
    } else {
        embed.setColor(colors.yellow).addField('It\'s a tie!', `${p1} vs ${p2}`)
        client.shifumiinteraction.get(game_interaction.id).options._subcommand = [null, null]
        await game_interaction.editReply({ embeds: [embed] })
    }
    return true
}

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
    callback: async ({client, interaction, args}) => {
        try {
            if (interaction.isCommand()) {
                client.shifumiinteraction.set(interaction.id, interaction)
                if (!args[0] || args[0].member.user.bot || args[0].user.id == interaction.user.id) {
                    const embed = new discord.MessageEmbed()
                    .setColor(colors.blue)
                    .setTitle('Shifumi')
                    .setFooter({ text: "Make your choice:" })
                    .addField('Player :', `${interaction.member}`)
                    const row = new discord.MessageActionRow().addComponents(
                        new discord.MessageButton()
                        .setCustomId(`shifumi_${interaction.id}_1_👊`)
                        .setLabel('👊')
                        .setStyle('SECONDARY'),
                        new discord.MessageButton()
                        .setCustomId(`shifumi_${interaction.id}_1_✋`)
                        .setLabel('✋')
                        .setStyle('SECONDARY'),
                        new discord.MessageButton()
                        .setCustomId(`shifumi_${interaction.id}_1_✌`)
                        .setLabel('✌')
                        .setStyle('SECONDARY'),
                    )
                    return { embeds: [embed], components: [row] }
                } else {
                    const embed = new discord.MessageEmbed()
                    .setTitle('Shifumi')
                    .setColor(colors.blue)
                    .setFooter({ text: "Make your choice:" })
                    .addField('Players :', `${interaction.member} vs ${args[0].member}`)
                    .addField(`Do you accept the challenge?`, `${args[0].member}`)
                    const row = new discord.MessageActionRow().addComponents(
                        new discord.MessageButton()
                        .setCustomId(`shifumi_${interaction.id}_2_yes`)
                        .setLabel('Yes')
                        .setStyle('SUCCESS'),
                        new discord.MessageButton()
                        .setCustomId(`shifumi_${interaction.id}_2_no`)
                        .setLabel('Nope')
                        .setStyle('DANGER'),
                    )
                    return { embeds: [embed], components: [row] }
                }
            }
            if (interaction.type == 'MESSAGE_COMPONENT') {
                const response = interaction.customId.split('_')
                game_interaction = client.shifumiinteraction.get(response[1])
                if (!game_interaction) return 'That game is no longer available'
                if (response[2] == '1') {
                    if (interaction.user.id != game_interaction.user.id) return 'It is not your game, lunch one if you want to play'
                    return await solo_game(client, interaction, game_interaction, response[3])
                }
                if (response[2] == '2') {
                    if (interaction.user.id != game_interaction.user.id && interaction.user.id != game_interaction.options._hoistedOptions[0].user.id) return 'It is not your game, lunch one if you want to play'
                    if (response[3] == 'yes') {
                        if (response.length == 4) {
                            client.shifumiinteraction.get(game_interaction.id).options._subcommand = [null, null]
                            if (interaction.user.id != game_interaction.options._hoistedOptions[0].user.id) return 'It is not your game, lunch one if you want to play'
                            const embed = new discord.MessageEmbed()
                            .setTitle('Shifumi')
                            .setColor(colors.blue)
                            .setFooter({ text: "Make your choice:" })
                            .addField('Players :', `${game_interaction.member} vs ${game_interaction.options._hoistedOptions[0].member}`)
                            const row = new discord.MessageActionRow().addComponents(
                                new discord.MessageButton()
                                .setCustomId(`shifumi_${game_interaction.id}_2_yes_👊`)
                                .setLabel('👊')
                                .setStyle('SECONDARY'),
                                new discord.MessageButton()
                                .setCustomId(`shifumi_${game_interaction.id}_2_yes_✋`)
                                .setLabel('✋')
                                .setStyle('SECONDARY'),
                                new discord.MessageButton()
                                .setCustomId(`shifumi_${game_interaction.id}_2_yes_✌`)
                                .setLabel('✌')
                                .setStyle('SECONDARY'),
                            )
                            await interaction.deleteReply()
                            await game_interaction.editReply({ embeds: [embed], components: [row] })
                            return true
                        } else {
                            if (game_interaction.user.id == interaction.user.id && game_interaction.options._subcommand[0] == null) client.shifumiinteraction.get(game_interaction.id).options._subcommand[0] = response[4]
                            else if (game_interaction.user.id == interaction.user.id && game_interaction.options._subcommand[0] != null) return 'You already played'
                            else if (game_interaction.options._hoistedOptions[0].user.id == interaction.user.id && game_interaction.options._subcommand[1] == null) client.shifumiinteraction.get(game_interaction.id).options._subcommand[1] = response[4]
                            else if (game_interaction.options._hoistedOptions[0].user.id == interaction.user.id && game_interaction.options._subcommand[1] != null) return 'You already played'

                            if (game_interaction.options._subcommand[0] != null && game_interaction.options._subcommand[1] != null) {
                                return await multi_game(client, interaction, game_interaction, game_interaction.options._subcommand[0], game_interaction.options._subcommand[1])
                            } else {
                                await interaction.deleteReply()
                                return true
                            }
                        }
                    } else {
                        await interaction.deleteReply()
                        var embed = interaction.message.embeds[0]
                        embed.fields = embed.fields.slice(0, -1)
                        embed.setColor(colors.red).setFooter({ text: ""}).addField("To bad!", `${interaction.member} don't want to play with you`);
                        await game_interaction.editReply({ embeds: [embed], components: [] })
                        client.shifumiinteraction.delete(game_interaction.id)
                        return true
                    }
                }
            }
        } catch (e) {console.log('Error in /rps:', e); return "Oups, I can't do that"}
    }
}