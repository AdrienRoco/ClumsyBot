const colors = require("../../colors.json");
const types = require("../../arg_type.json");
const discord = require("discord.js");

async function result_shifumi(p1, p2) {
    if (p1 == '👊' && p2 == '✌' || p1 == '✌' && p2 == '✋' || p1 == '✋' && p2 == '👊') {return 'p1'}
    if (p1 == '👊' && p2 == '✋' || p1 == '✌' && p2 == '👊' || p1 == '✋' && p2 == '✌') {return 'p2'}
    if (p1 == '👊' && p2 == '👊' || p1 == '✌' && p2 == '✌' || p1 == '✋' && p2 == '✋') {return 'draw'}
}

async function solo_shifumi(client, interaction, game_interaction, p1) {
    await interaction.deleteReply()
    possibilty = ['👊', '✋', '✌'];
    p2 = possibilty[Math.floor(Math.random() * possibilty.length)];
    var result = await result_shifumi(p1, p2);
    var embed = interaction.message.embeds[0]
    if (result != 'draw') {
        embed.setColor(result == 'p1' ? colors.green : colors.red ).addField(result == 'p1' ? 'You won!' : 'You lost!', `${p1} vs ${p2}`).setFooter({ text: ""})
        .addField('Winner:', result == 'p1' ? `${game_interaction.user}` : `${client.user}!`)
        await game_interaction.editReply({ embeds: [embed], components: [] })
        client.gamesinteractions.delete(game_interaction.id)
    } else {
        embed.setColor(colors.yellow).addField('It\'s a tie!', `${p1} vs ${p2}`)
        await game_interaction.editReply({ embeds: [embed] })
    }
    return true
}

async function multi_shifumi(client, interaction, game_interaction, p1, p2) {
    await interaction.deleteReply()
    var result = await result_shifumi(p1, p2);
    var embed = interaction.message.embeds[0]
    if (result != 'draw') {
        embed.setColor(colors.green).addField('Someone won!', `${p1} vs ${p2}`).setFooter({ text: ""})
        .addField('Winner:', result == 'p1' ? `${game_interaction.user}` : `${game_interaction.options._hoistedOptions[1].user}`)
        await game_interaction.editReply({ embeds: [embed], components: [] })
        client.gamesinteractions.delete(game_interaction.id)
    } else {
        embed.setColor(colors.yellow).addField('It\'s a tie!', `${p1} vs ${p2}`)
        client.gamesinteractions.get(game_interaction.id).options._subcommand = [null, null]
        await game_interaction.editReply({ embeds: [embed] })
    }
    return true
}

async function create_buttons_tictactoe(id, nPlayers, matrice, winmoves = [null, null, null, null, null, null, null, null, null]) {
    const row1 = new discord.MessageActionRow().addComponents(
        new discord.MessageButton()
        .setCustomId(`play_${id}_${nPlayers}_1_1`)
        .setLabel(matrice[0][0] == 0 ? ' ' : matrice[0][0] == 1 ? '❌' : '⭕')
        .setDisabled(winmoves[0] != null ? true : matrice[0][0] != 0 ? true : false)
        .setStyle(winmoves[0] ? 'SUCCESS' : 'SECONDARY'),
        new discord.MessageButton()
        .setCustomId(`play_${id}_${nPlayers}_2_1`)
        .setLabel(matrice[0][1] == 0 ? ' ' : matrice[0][1] == 1 ? '❌' : '⭕')
        .setDisabled(winmoves[1] != null ? true : matrice[0][1] != 0 ? true : false)
        .setStyle(winmoves[1] ? 'SUCCESS' : 'SECONDARY'),
        new discord.MessageButton()
        .setCustomId(`play_${id}_${nPlayers}_3_1`)
        .setLabel(matrice[0][2] == 0 ? ' ' : matrice[0][2] == 1 ? '❌' : '⭕')
        .setDisabled(winmoves[2] != null ? true : matrice[0][2] != 0 ? true : false)
        .setStyle(winmoves[2] ? 'SUCCESS' : 'SECONDARY')
    )
    const row2 = new discord.MessageActionRow().addComponents(
        new discord.MessageButton()
        .setCustomId(`play_${id}_${nPlayers}_1_2`)
        .setLabel(matrice[1][0] == 0 ? ' ' : matrice[1][0] == 1 ? '❌' : '⭕')
        .setDisabled(winmoves[3] != null ? true : matrice[1][0] != 0 ? true : false)
        .setStyle(winmoves[3] ? 'SUCCESS' : 'SECONDARY'),
        new discord.MessageButton()
        .setCustomId(`play_${id}_${nPlayers}_2_2`)
        .setLabel(matrice[1][1] == 0 ? ' ' : matrice[1][1] == 1 ? '❌' : '⭕')
        .setDisabled(winmoves[4] != null ? true : matrice[1][1] != 0 ? true : false)
        .setStyle(winmoves[4] ? 'SUCCESS' : 'SECONDARY'),
        new discord.MessageButton()
        .setCustomId(`play_${id}_${nPlayers}_3_2`)
        .setLabel(matrice[1][2] == 0 ? ' ' : matrice[1][2] == 1 ? '❌' : '⭕')
        .setDisabled(winmoves[5] != null ? true : matrice[1][2] != 0 ? true : false)
        .setStyle(winmoves[5] ? 'SUCCESS' : 'SECONDARY')
    )
    const row3 = new discord.MessageActionRow().addComponents(
        new discord.MessageButton()
        .setCustomId(`play_${id}_${nPlayers}_1_3`)
        .setLabel(matrice[2][0] == 0 ? ' ' : matrice[2][0] == 1 ? '❌' : '⭕')
        .setDisabled(winmoves[6] != null ? true : matrice[2][0] != 0 ? true : false)
        .setStyle(winmoves[6] ? 'SUCCESS' : 'SECONDARY'),
        new discord.MessageButton()
        .setCustomId(`play_${id}_${nPlayers}_2_3`)
        .setLabel(matrice[2][1] == 0 ? ' ' : matrice[2][1] == 1 ? '❌' : '⭕')
        .setDisabled(winmoves[7] != null ? true : matrice[2][1] != 0 ? true : false)
        .setStyle(winmoves[7] ? 'SUCCESS' : 'SECONDARY'),
        new discord.MessageButton()
        .setCustomId(`play_${id}_${nPlayers}_3_3`)
        .setLabel(matrice[2][2] == 0 ? ' ' : matrice[2][2] == 1 ? '❌' : '⭕')
        .setDisabled(winmoves[8] != null ? true : matrice[2][2] != 0 ? true : false)
        .setStyle(winmoves[8] ? 'SUCCESS' : 'SECONDARY')
    )
    return [row1, row2, row3]
}

async function check_placement_tictactoe(matrice) {
    if (matrice[0][0] == matrice[0][1] && matrice[0][1] == matrice[0][2] && matrice[0][0] != 0) return [matrice[0][0], [1, 1, 1, 0, 0, 0, 0, 0, 0]]
    if (matrice[1][0] == matrice[1][1] && matrice[1][1] == matrice[1][2] && matrice[1][0] != 0) return [matrice[1][0], [0, 0, 0, 1, 1, 1, 0, 0, 0]]
    if (matrice[2][0] == matrice[2][1] && matrice[2][1] == matrice[2][2] && matrice[2][0] != 0) return [matrice[2][0], [0, 0, 0, 0, 0, 0, 1, 1, 1]]
    if (matrice[0][0] == matrice[1][0] && matrice[1][0] == matrice[2][0] && matrice[0][0] != 0) return [matrice[0][0], [1, 0, 0, 1, 0, 0, 1, 0, 0]]
    if (matrice[0][1] == matrice[1][1] && matrice[1][1] == matrice[2][1] && matrice[0][1] != 0) return [matrice[0][1], [0, 1, 0, 0, 1, 0, 0, 1, 0]]
    if (matrice[0][2] == matrice[1][2] && matrice[1][2] == matrice[2][2] && matrice[0][2] != 0) return [matrice[0][2], [0, 0, 1, 0, 0, 1, 0, 0, 1]]
    if (matrice[0][0] == matrice[1][1] && matrice[1][1] == matrice[2][2] && matrice[0][0] != 0) return [matrice[0][0], [1, 0, 0, 0, 1, 0, 0, 0, 1]]
    if (matrice[0][2] == matrice[1][1] && matrice[1][1] == matrice[2][0] && matrice[0][2] != 0) return [matrice[0][2], [0, 0, 1, 0, 1, 0, 1, 0, 0]]
    if (matrice[0][0] != 0 && matrice[0][1] != 0 && matrice[0][2] != 0 && matrice[1][0] != 0 && matrice[1][1] != 0 && matrice[1][2] != 0 && matrice[2][0] != 0 && matrice[2][1] != 0 && matrice[2][2] != 0) return [-1, [0, 0, 0, 0, 0, 0, 0, 0, 0]]
    return [0]
}

async function check_win_tictactoe(client, interaction, game_interaction, matrice, nPlayers = 1) {
    const win = await check_placement_tictactoe(matrice)
    rows = await create_buttons_tictactoe(game_interaction.id, nPlayers, matrice, win[1])
    if (win[0] > 0) {
        const embed = interaction.message.embeds[0]
        .setColor(win[0] == 1 ? colors.green : nPlayers == 2 ? colors.green : colors.red).setFooter({ text: "" })
        .addField('Winner:', `${win[0] == 1 ? game_interaction.member : nPlayers == 1 ? client.user : game_interaction.options._hoistedOptions[1].user}!`)
        await game_interaction.editReply({ embeds: [embed], components: rows })
        client.gamesinteractions.delete(game_interaction.id)
        return true
    } else if (win[0] == -1) {
        const embed = interaction.message.embeds[0]
        .setColor(colors.yellow).setFooter({ text: "" })
        .addField('Winner:', 'No winner, it\'s a tie!')
        await game_interaction.editReply({ embeds: [embed], components: rows })
        client.gamesinteractions.delete(game_interaction.id)
        return true
    } else {
        await game_interaction.editReply({ components: rows })
        return false
    }
}

function check_patern_tictactoe(matrice, patern) {
    for (i in matrice) if (JSON.stringify(matrice[i]) == JSON.stringify(patern)) return [parseInt(i), parseInt(patern.indexOf(0))]
    for (i in matrice) if (JSON.stringify([matrice[0][i], matrice[1][i], matrice[2][i]]) == JSON.stringify(patern)) return [parseInt(patern.indexOf(0)), parseInt(i)]
    if (JSON.stringify([matrice[0][0], matrice[1][1], matrice[2][2]]) == JSON.stringify(patern)) return [parseInt(patern.indexOf(0)), parseInt(patern.indexOf(0))]
    if (JSON.stringify([matrice[2][0], matrice[1][1], matrice[0][2]]) == JSON.stringify(patern)) return [parseInt(patern.indexOf(0)) == 0 ? 2 : parseInt(patern.indexOf(0)) == 1 ? 1 : 0 , parseInt(patern.indexOf(0))]
    return null
}

async function gess_move_tictactoe(matrice, first) {
    paterns = [[2, 2, 0], [2, 0, 2], [0, 2, 2], [1, 1, 0], [1, 0, 1], [0, 1, 1]]
    for (p in paterns) if (check_patern_tictactoe(matrice, paterns[p])) return check_patern_tictactoe(matrice, paterns[p])
    if (matrice[0][0] == 2 && matrice[0][1] == 1 && matrice[2][0] == 0 && matrice[1][0] == 0 || matrice[2][2] == 2 && matrice[1][2] == 1 && matrice[2][0] == 0 && matrice[2][1] == 0) return [2, 0]
    if (matrice[0][0] == 2 && matrice[1][0] == 1 && matrice[0][2] == 0 && matrice[0][1] == 0 || matrice[2][2] == 2 && matrice[2][1] == 1 && matrice[0][2] == 0 && matrice[1][2] == 0) return [0, 2]
    if (matrice[0][2] == 2 && matrice[1][2] == 1 && matrice[0][0] == 0 && matrice[0][1] == 0 || matrice[2][0] == 2 && matrice[2][1] == 1 && matrice[0][0] == 0 && matrice[1][0] == 0) return [0, 0]
    if (matrice[0][2] == 2 && matrice[0][1] == 1 && matrice[2][2] == 0 && matrice[1][2] == 0 || matrice[2][0] == 2 && matrice[1][0] == 1 && matrice[2][2] == 0 && matrice[2][1] == 0) return [2, 2]
    paterns = [[2, 1, 0], [0, 1, 2]]
    for (p in paterns) if (check_patern_tictactoe(matrice, paterns[p])) return check_patern_tictactoe(matrice, paterns[p])
    if (first) {
        if (matrice[0][0] == 0) return [0, 0]
        if (matrice[0][2] == 0) return [0, 2]
        if (matrice[2][0] == 0) return [2, 0]
        if (matrice[2][2] == 0) return [2, 2]
        if (matrice[1][1] == 0) return [1, 1]
        if (matrice[0][1] == 0) return [0, 1]
        if (matrice[1][0] == 0) return [1, 0]
        if (matrice[1][2] == 0) return [1, 2]
        if (matrice[2][1] == 0) return [2, 1]
    } else {
        if (matrice[1][1] == 1 && matrice[0][0] == 0) return [0, 0]
        if (matrice[1][1] == 1 && matrice[0][2] == 0) return [0, 2]
        if (matrice[1][1] == 1 && matrice[2][0] == 0) return [2, 0]
        if (matrice[1][1] == 1 && matrice[2][2] == 0) return [2, 2]
        if (matrice[0][1] == 1 && matrice[1][0] == 1 && matrice[0][0] == 0) return [0, 0]
        if (matrice[0][1] == 1 && matrice[1][2] == 1 && matrice[0][2] == 0) return [0, 2]
        if (matrice[1][0] == 1 && matrice[2][1] == 1 && matrice[2][0] == 0) return [2, 0]
        if (matrice[1][2] == 1 && matrice[2][1] == 1 && matrice[2][2] == 0) return [2, 2]
        if (matrice[1][1] == 0) return [1, 1]
        if (matrice[0][1] == 0) return [0, 1]
        if (matrice[1][0] == 0) return [1, 0]
        if (matrice[1][2] == 0) return [1, 2]
        if (matrice[2][1] == 0) return [2, 1]
        if (matrice[0][0] == 0) return [0, 0]
        if (matrice[0][2] == 0) return [0, 2]
        if (matrice[2][0] == 0) return [2, 0]
        if (matrice[2][2] == 0) return [2, 2]
    }
}

async function solo_tictactoe(client, interaction, game_interaction, x, y) {
    await interaction.deleteReply()
    client.gamesinteractions.get(game_interaction.id).options._subcommand[0][y][x] = 1
    if (await check_win_tictactoe(client, interaction, game_interaction, client.gamesinteractions.get(game_interaction.id).options._subcommand[0])) return true
    const bot = await gess_move_tictactoe(client.gamesinteractions.get(game_interaction.id).options._subcommand[0], client.gamesinteractions.get(game_interaction.id).options._subcommand[1])
    client.gamesinteractions.get(game_interaction.id).options._subcommand[0][bot[0]][bot[1]] = 2
    if (await check_win_tictactoe(client, interaction, game_interaction, client.gamesinteractions.get(game_interaction.id).options._subcommand[0])) return true
    return true
}

async function multi_tictactoe(client, interaction, game_interaction, x, y) {
    await interaction.deleteReply()
    client.gamesinteractions.get(game_interaction.id).options._subcommand[0][y][x] = game_interaction.options._subcommand[1] + 1
    client.gamesinteractions.get(game_interaction.id).options._subcommand[1] = game_interaction.options._subcommand[1] == 1 ? 0 : 1
    if (await check_win_tictactoe(client, interaction, game_interaction, client.gamesinteractions.get(game_interaction.id).options._subcommand[0], 2)) return true
    return true
}

module.exports = {
    test: false,
    name: 'play',
    description: 'Want to play some games?',
    args: [
        {
            name: 'game',
            description: 'The game you want to play',
            type: types.string,
            required: true,
            choices: [
                {
                    name: 'shifumi',
                    value: 'shifumi'
                },
                {
                    name: 'tic-tac-toe',
                    value: 'tictactoe'
                }
            ],
        },
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
                client.gamesinteractions.set(interaction.id, interaction)
                if (args[0].value == 'shifumi') {
                    if (!args[1] || args[1].member.user.bot || args[1].user.id == interaction.user.id) {
                        const embed = new discord.MessageEmbed()
                        .setColor(colors.blue)
                        .setTitle('Shifumi')
                        .setFooter({ text: "Make your choice:" })
                        .addField('Player :', `${interaction.member}`)
                        const row = new discord.MessageActionRow().addComponents(
                            new discord.MessageButton()
                            .setCustomId(`play_${interaction.id}_1_👊`)
                            .setLabel('👊')
                            .setStyle('SECONDARY'),
                            new discord.MessageButton()
                            .setCustomId(`play_${interaction.id}_1_✋`)
                            .setLabel('✋')
                            .setStyle('SECONDARY'),
                            new discord.MessageButton()
                            .setCustomId(`play_${interaction.id}_1_✌`)
                            .setLabel('✌')
                            .setStyle('SECONDARY'),
                        )
                        return { embeds: [embed], components: [row] }
                    } else {
                        const embed = new discord.MessageEmbed()
                        .setTitle('Shifumi')
                        .setColor(colors.blue)
                        .setFooter({ text: "Make your choice:" })
                        .addField('Players :', `${interaction.member} vs ${args[1].member}`)
                        .addField(`Do you accept the challenge?`, `${args[1].member}`)
                        const row = new discord.MessageActionRow().addComponents(
                            new discord.MessageButton()
                            .setCustomId(`play_${interaction.id}_2_yes`)
                            .setLabel('Yes')
                            .setStyle('SUCCESS'),
                            new discord.MessageButton()
                            .setCustomId(`play_${interaction.id}_2_no`)
                            .setLabel('Nope')
                            .setStyle('DANGER'),
                        )
                        return { embeds: [embed], components: [row] }
                    }
                } else if (args[0].value == 'tictactoe') {
                    client.gamesinteractions.get(interaction.id).options._subcommand = [[[0,0,0],[0,0,0],[0,0,0]]]
                    if (!args[1] || args[1].member.user.bot || args[1].user.id == interaction.user.id) {
                        const first = Math.round(Math.random())
                        const embed = new discord.MessageEmbed()
                        .setColor(colors.blue)
                        .setTitle('Tic Tac Toe')
                        .setFooter({ text: "Make your choice:" })
                        .addField('Player ❌:', `${interaction.member}`)
                        .addField('Player ⭕:', `${client.user}`)
                        .addField('First to play:', `${first == 0 ? '❌' : '⭕'}`)
                        if (first) client.gamesinteractions.get(interaction.id).options._subcommand[0][Math.round(Math.random()) ? 0 : 2][Math.round(Math.random()) ? 0 : 2] = 2
                        client.gamesinteractions.get(interaction.id).options._subcommand[1] = first
                        const rows = await create_buttons_tictactoe(interaction.id, 1, client.gamesinteractions.get(interaction.id).options._subcommand[0])
                        return { embeds: [embed], components: rows }
                    } else {
                        const embed = new discord.MessageEmbed()
                        .setTitle('Tic Tac Toe')
                        .setColor(colors.blue)
                        .setFooter({ text: "Make your choice:" })
                        .addField('Players :', `${interaction.member} vs ${args[1].member}`)
                        .addField(`Do you accept the challenge?`, `${args[1].member}`)
                        const row = new discord.MessageActionRow().addComponents(
                            new discord.MessageButton()
                            .setCustomId(`play_${interaction.id}_2_1`)
                            .setLabel('Yes')
                            .setStyle('SUCCESS'),
                            new discord.MessageButton()
                            .setCustomId(`play_${interaction.id}_2_0`)
                            .setLabel('Nope')
                            .setStyle('DANGER'),
                        )
                        return { embeds: [embed], components: [row] }
                    }
                }
            }
            if (interaction.isButton()) {
                const response = interaction.customId.split('_')
                game_interaction = client.gamesinteractions.get(response[1])
                if (!game_interaction) return 'That game is no longer available'
                if (game_interaction.options._hoistedOptions[0].value == 'shifumi') {
                    if (response[2] == '1') {
                        if (interaction.user.id != game_interaction.user.id) return 'It is not your game, lunch one if you want to play'
                        return await solo_shifumi(client, interaction, game_interaction, response[3])
                    }
                    if (response[2] == '2') {
                        if (interaction.user.id != game_interaction.user.id && interaction.user.id != game_interaction.options._hoistedOptions[1].user.id) return 'It is not your game, lunch one if you want to play'
                        if (response[3] == 'yes') {
                            if (response.length == 4) {
                                client.gamesinteractions.get(game_interaction.id).options._subcommand = [null, null]
                                if (interaction.user.id != game_interaction.options._hoistedOptions[1].user.id) return 'It is not your game, lunch one if you want to play'
                                await interaction.deleteReply()
                                const embed = new discord.MessageEmbed()
                                .setTitle('Shifumi')
                                .setColor(colors.blue)
                                .setFooter({ text: "Make your choice:" })
                                .addField('Players :', `${game_interaction.member} vs ${game_interaction.options._hoistedOptions[1].member}`)
                                const row = new discord.MessageActionRow().addComponents(
                                    new discord.MessageButton()
                                    .setCustomId(`play_${game_interaction.id}_2_yes_👊`)
                                    .setLabel('👊')
                                    .setStyle('SECONDARY'),
                                    new discord.MessageButton()
                                    .setCustomId(`play_${game_interaction.id}_2_yes_✋`)
                                    .setLabel('✋')
                                    .setStyle('SECONDARY'),
                                    new discord.MessageButton()
                                    .setCustomId(`play_${game_interaction.id}_2_yes_✌`)
                                    .setLabel('✌')
                                    .setStyle('SECONDARY'),
                                )
                                await game_interaction.editReply({ embeds: [embed], components: [row] })
                                return true
                            } else {
                                if (game_interaction.user.id == interaction.user.id && game_interaction.options._subcommand[0] == null) client.gamesinteractions.get(game_interaction.id).options._subcommand[0] = response[4]
                                else if (game_interaction.user.id == interaction.user.id && game_interaction.options._subcommand[0] != null) return 'You already played'
                                else if (game_interaction.options._hoistedOptions[1].user.id == interaction.user.id && game_interaction.options._subcommand[1] == null) client.gamesinteractions.get(game_interaction.id).options._subcommand[1] = response[4]
                                else if (game_interaction.options._hoistedOptions[1].user.id == interaction.user.id && game_interaction.options._subcommand[1] != null) return 'You already played'

                                if (game_interaction.options._subcommand[0] != null && game_interaction.options._subcommand[1] != null) {
                                    return await multi_shifumi(client, interaction, game_interaction, game_interaction.options._subcommand[0], game_interaction.options._subcommand[1])
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
                            client.gamesinteractions.delete(game_interaction.id)
                            return true
                        }
                    }
                } else if (game_interaction.options._hoistedOptions[0].value == 'tictactoe') {
                    const response = interaction.customId.split('_')
                    game_interaction = client.gamesinteractions.get(response[1])
                    if (!game_interaction) return 'That game is no longer available'
                    if (response[2] == '1') {
                        if (interaction.user.id != game_interaction.user.id) return 'It is not your game, lunch one if you want to play'
                        return await solo_tictactoe(client, interaction, game_interaction, parseInt(response[3]) - 1, parseInt(response[4]) - 1)
                    }
                    if (response[2] == '2') {
                        if (interaction.user.id != game_interaction.user.id && interaction.user.id != game_interaction.options._hoistedOptions[1].user.id) return 'It is not your game, lunch one if you want to play'
                        if (parseInt(response[3]) > 0) {
                            if (response.length == 4) {
                                if (interaction.user.id != game_interaction.options._hoistedOptions[1].user.id) return 'It is not your game, lunch one if you want to play'
                                await interaction.deleteReply()
                                var first = Math.round(Math.random())
                                const embed = new discord.MessageEmbed()
                                .setTitle('Tic Tac Toe')
                                .setColor(colors.blue)
                                .setFooter({ text: "Make your choice:" })
                                .addField('Player ❌:', `${game_interaction.member}`)
                                .addField('Player ⭕️:', `${game_interaction.options._hoistedOptions[1].member}`)
                                .addField('First to play:', `${first == 0 ? '❌' : '⭕'}`)
                                const rows = await create_buttons_tictactoe(game_interaction.id, 2, client.gamesinteractions.get(game_interaction.id).options._subcommand[0])
                                client.gamesinteractions.get(game_interaction.id).options._subcommand[1] = first
                                await game_interaction.editReply({ embeds: [embed], components: rows })
                                return true
                            } else {
                                if (interaction.user.id == game_interaction.user.id && game_interaction.options._subcommand[1] == 1) return 'It is not your turn'
                                if (interaction.user.id == game_interaction.options._hoistedOptions[1].user.id && game_interaction.options._subcommand[1] == 0) return 'It is not your turn'
                                return await multi_tictactoe(client, interaction, game_interaction, parseInt(response[3]) - 1, parseInt(response[4]) - 1)
                            }
                        } else {
                            await interaction.deleteReply()
                            var embed = interaction.message.embeds[0]
                            embed.fields = embed.fields.slice(0, -1)
                            embed.setColor(colors.red).setFooter({ text: ""}).addField("To bad!", `${interaction.member} don't want to play with you`);
                            await game_interaction.editReply({ embeds: [embed], components: [] })
                            client.gamesinteractions.delete(game_interaction.id)
                            return true
                        }
                    }
                }
            }
        } catch (e) {console.log('Error in /play:', e); return "Oups, I can't do that"}
    }
}