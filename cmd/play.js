const DiscordJS = require("discord.js");

// Start of Shifumi
function convert(p) {
    if (p == 'R') {return '👊'}
    if (p == 'P') {return '✋'}
    if (p == 'S') {return '✌️'}
}

function result_shifumi(p1, p2) {
    if (p1 == 'R' && p2 == 'S' || p1 == 'P' && p2 == 'R' || p1 == 'S' && p2 == 'P') {return 'p1'}
    if (p1 == 'R' && p2 == 'P' || p1 == 'P' && p2 == 'S' || p1 == 'S' && p2 == 'R') {return 'p2'}
    if (p1 == 'R' && p2 == 'R' || p1 == 'P' && p2 == 'P' || p1 == 'S' && p2 == 'S') {return 'draw'}
}

async function solo_shifumi(client, interaction, game_interaction, p1) {
    possibility = ['R', 'P', 'S'];
    p2 = possibility[Math.floor(Math.random() * possibility.length)];
    const result = result_shifumi(p1, p2);
    if (result != 'draw') {
        const embed = DiscordJS.EmbedBuilder.from(interaction.message.embeds[0])
        .setColor(result == 'p1' ? DiscordJS.Colors.Green : DiscordJS.Colors.Red)
        .setFooter({text: null})
        .addFields([
            {name: `You ${result == 'p1' ? 'won!' : 'lost!'}`, value: `${convert(p1)} vs ${convert(p2)}`},
            {name: 'Winner:', value: result == 'p1' ? `${game_interaction.user}` : `${client.user}!`}])
        await game_interaction.editReply({ embeds: [embed], components: [] })
        try {client.CacheInteractions.delete(game_interaction.id)} catch {}
    } else {
        const embed = DiscordJS.EmbedBuilder.from(interaction.message.embeds[0])
        .setColor(DiscordJS.Colors.Yellow)
        .addFields([{name: 'It\'s a tie!', value: `${convert(p1)} vs ${convert(p2)}`}])
        await game_interaction.editReply({ embeds: [embed] })
    }
}

async function multi_shifumi(client, interaction, game_interaction, p1, p2) {
    var result = result_shifumi(p1, p2);
    if (result != 'draw') {
        const embed = DiscordJS.EmbedBuilder.from(interaction.message.embeds[0])
        .setColor(DiscordJS.Colors.Green)
        .setFooter({text: null})
        .addFields([
            {name: 'Someone won!', value: `${convert(p1)} vs ${convert(p2)}`},
            {name: 'Winner:', value: result == 'p1' ? `${game_interaction.user}` : `${game_interaction.options._hoistedOptions[1].user}`}])
        await game_interaction.editReply({ embeds: [embed], components: [] })
        try {client.CacheInteractions.delete(game_interaction.id)} catch {}
    } else {
        const embed = DiscordJS.EmbedBuilder.from(interaction.message.embeds[0])
        .setColor(DiscordJS.Colors.Yellow)
        .addFields([{name: 'It\'s a tie!', value: `${convert(p1)} vs ${convert(p2)}`}])
        client.CacheInteractions.get(game_interaction.id).options._subcommand = [null, null]
        await game_interaction.editReply({ embeds: [embed] })
    }
}

async function manage_shifumi(client, interaction, game_interaction, response) {
    if (response[2] == '1') {
        if (interaction.user.id != game_interaction.user.id) {await interaction.editReply({content: 'It\'s not your game to play.'}); return false}
        await solo_shifumi(client, interaction, game_interaction, response[3])
    }
    if (response[2] == '2') {
        if (interaction.user.id != game_interaction.user.id && interaction.user.id != game_interaction.options._hoistedOptions[1].user.id) {await interaction.editReply({content: 'It\'s not your game to play.'}); return false}
        if (response[3] == 'yes') {
            if (response.length == 4) {
                client.CacheInteractions.get(game_interaction.id).options._subcommand = [null, null]
                if (interaction.user.id != game_interaction.options._hoistedOptions[1].user.id) {await interaction.editReply({content: 'It\'s not your game to play.'}); return false}
                const embed = new DiscordJS.EmbedBuilder()
                    .setTitle('Shifumi')
                    .setColor(DiscordJS.Colors.Blue)
                    .setFooter({ text: "Make your choice:" })
                    .addFields([{name: 'Players :', value: `${game_interaction.member} vs ${game_interaction.options._hoistedOptions[1].member}`}])
                    const row = new DiscordJS.ActionRowBuilder().addComponents(
                    new DiscordJS.ButtonBuilder()
                        .setCustomId(`play_${game_interaction.id}_2_yes_R`)
                        .setLabel('👊')
                        .setStyle(DiscordJS.ButtonStyle.Secondary),
                    new DiscordJS.ButtonBuilder()
                        .setCustomId(`play_${game_interaction.id}_2_yes_P`)
                        .setLabel('✋')
                        .setStyle(DiscordJS.ButtonStyle.Secondary),
                    new DiscordJS.ButtonBuilder()
                        .setCustomId(`play_${game_interaction.id}_2_yes_S`)
                        .setLabel('✌️')
                        .setStyle(DiscordJS.ButtonStyle.Secondary))
                await game_interaction.editReply({ embeds: [embed], components: [row] })
                return true
            } else {
                if (game_interaction.user.id == interaction.user.id && game_interaction.options._subcommand[0] == null) client.CacheInteractions.get(game_interaction.id).options._subcommand[0] = response[4]
                else if (game_interaction.user.id == interaction.user.id && game_interaction.options._subcommand[0] != null) {await interaction.editReply({content: 'You already played'}); return false}
                else if (game_interaction.options._hoistedOptions[1].user.id == interaction.user.id && game_interaction.options._subcommand[1] == null) client.CacheInteractions.get(game_interaction.id).options._subcommand[1] = response[4]
                else if (game_interaction.options._hoistedOptions[1].user.id == interaction.user.id && game_interaction.options._subcommand[1] != null) {await interaction.editReply({content: 'You already played'}); return false}
                if (game_interaction.options._subcommand[0] != null && game_interaction.options._subcommand[1] != null) {
                    await multi_shifumi(client, interaction, game_interaction, game_interaction.options._subcommand[0], game_interaction.options._subcommand[1])
                    return true
                }
            }
        } else {
            const embed = DiscordJS.EmbedBuilder.from(interaction.message.embeds[0])
            .setColor(DiscordJS.Colors.Red).setFooter({text: null})
            .addFields([{name: "To bad!", value: `${interaction.member} don't want to play with you`}])
            await game_interaction.editReply({ embeds: [embed], components: [] })
            try {client.CacheInteractions.delete(game_interaction.id)} catch {}
            return true
        }
    }
    return true
}

async function start_shifumi(client, interaction, options) {
    client.CacheInteractions.set(interaction.id, interaction)
    if (!options[1] || options[1].member.user.bot || options[1].user.id == interaction.user.id) {
        const embed = new DiscordJS.EmbedBuilder()
        .setColor(DiscordJS.Colors.Blue)
        .setTitle('Shifumi')
        .setFooter({ text: "Make your choice:" })
        .addFields([{name: 'Player :', value: `${interaction.member}`}])
        const row = new DiscordJS.ActionRowBuilder().addComponents(
            new DiscordJS.ButtonBuilder()
                .setCustomId(`play_${interaction.id}_1_R`)
                .setLabel('👊')
                .setStyle(DiscordJS.ButtonStyle.Secondary),
            new DiscordJS.ButtonBuilder()
                .setCustomId(`play_${interaction.id}_1_P`)
                .setLabel('✋')
                .setStyle(DiscordJS.ButtonStyle.Secondary),
            new DiscordJS.ButtonBuilder()
                .setCustomId(`play_${interaction.id}_1_S`)
                .setLabel('✌️')
                .setStyle(DiscordJS.ButtonStyle.Secondary))
        await interaction.editReply({embeds: [embed], components: [row]})
    } else {
        const embed = new DiscordJS.EmbedBuilder()
        .setTitle('Shifumi')
        .setColor(DiscordJS.Colors.Blue)
        .setFooter({ text: "Make your choice:" })
        .addFields([{name: 'Players :', value: `${interaction.member} vs ${options[1].member}`}, {name: `Do you accept the challenge?`, value: `${options[1].member}`}])
        const row = new DiscordJS.ActionRowBuilder().addComponents(
            new DiscordJS.ButtonBuilder()
                .setCustomId(`play_${interaction.id}_2_yes`)
                .setLabel('Yes')
                .setStyle(DiscordJS.ButtonStyle.Success),
            new DiscordJS.ButtonBuilder()
                .setCustomId(`play_${interaction.id}_2_no`)
                .setLabel('Nope')
                .setStyle(DiscordJS.ButtonStyle.Danger))
        try {const m = await interaction.channel.send({ content: `${options[1].member}` }); setTimeout(() => m.delete(), 100)} catch {}
        await interaction.editReply({embeds: [embed], components: [row]})
    }
}
// End of Shifumi
// ------------------------------------------
// Start of TicTacToe
function create_buttons_tictactoe(id, nPlayers, matrice, win_moves = [null, null, null, null, null, null, null, null, null]) {
    const row1 = new DiscordJS.ActionRowBuilder().addComponents(
        new DiscordJS.ButtonBuilder()
            .setCustomId(`play_${id}_${nPlayers}_1_1`)
            .setLabel(matrice[0][0] == 0 ? '‎ ' : matrice[0][0] == 1 ? '❌' : '⭕')
            .setDisabled(win_moves[0] != null ? true : matrice[0][0] != 0 ? true : false)
            .setStyle(win_moves[0] ? DiscordJS.ButtonStyle.Success : DiscordJS.ButtonStyle.Secondary),
        new DiscordJS.ButtonBuilder()
            .setCustomId(`play_${id}_${nPlayers}_2_1`)
            .setLabel(matrice[0][1] == 0 ? '‎ ' : matrice[0][1] == 1 ? '❌' : '⭕')
            .setDisabled(win_moves[1] != null ? true : matrice[0][1] != 0 ? true : false)
            .setStyle(win_moves[1] ? DiscordJS.ButtonStyle.Success : DiscordJS.ButtonStyle.Secondary),
        new DiscordJS.ButtonBuilder()
            .setCustomId(`play_${id}_${nPlayers}_3_1`)
            .setLabel(matrice[0][2] == 0 ? '‎ ' : matrice[0][2] == 1 ? '❌' : '⭕')
            .setDisabled(win_moves[2] != null ? true : matrice[0][2] != 0 ? true : false)
            .setStyle(win_moves[2] ? DiscordJS.ButtonStyle.Success : DiscordJS.ButtonStyle.Secondary))
    const row2 = new DiscordJS.ActionRowBuilder().addComponents(
        new DiscordJS.ButtonBuilder()
            .setCustomId(`play_${id}_${nPlayers}_1_2`)
            .setLabel(matrice[1][0] == 0 ? '‎ ' : matrice[1][0] == 1 ? '❌' : '⭕')
            .setDisabled(win_moves[3] != null ? true : matrice[1][0] != 0 ? true : false)
            .setStyle(win_moves[3] ? DiscordJS.ButtonStyle.Success : DiscordJS.ButtonStyle.Secondary),
        new DiscordJS.ButtonBuilder()
            .setCustomId(`play_${id}_${nPlayers}_2_2`)
            .setLabel(matrice[1][1] == 0 ? '‎ ' : matrice[1][1] == 1 ? '❌' : '⭕')
            .setDisabled(win_moves[4] != null ? true : matrice[1][1] != 0 ? true : false)
            .setStyle(win_moves[4] ? DiscordJS.ButtonStyle.Success : DiscordJS.ButtonStyle.Secondary),
        new DiscordJS.ButtonBuilder()
            .setCustomId(`play_${id}_${nPlayers}_3_2`)
            .setLabel(matrice[1][2] == 0 ? '‎ ' : matrice[1][2] == 1 ? '❌' : '⭕')
            .setDisabled(win_moves[5] != null ? true : matrice[1][2] != 0 ? true : false)
            .setStyle(win_moves[5] ? DiscordJS.ButtonStyle.Success : DiscordJS.ButtonStyle.Secondary))
    const row3 = new DiscordJS.ActionRowBuilder().addComponents(
        new DiscordJS.ButtonBuilder()
            .setCustomId(`play_${id}_${nPlayers}_1_3`)
            .setLabel(matrice[2][0] == 0 ? '‎ ' : matrice[2][0] == 1 ? '❌' : '⭕')
            .setDisabled(win_moves[6] != null ? true : matrice[2][0] != 0 ? true : false)
            .setStyle(win_moves[6] ? DiscordJS.ButtonStyle.Success : DiscordJS.ButtonStyle.Secondary),
        new DiscordJS.ButtonBuilder()
            .setCustomId(`play_${id}_${nPlayers}_2_3`)
            .setLabel(matrice[2][1] == 0 ? '‎ ' : matrice[2][1] == 1 ? '❌' : '⭕')
            .setDisabled(win_moves[7] != null ? true : matrice[2][1] != 0 ? true : false)
            .setStyle(win_moves[7] ? DiscordJS.ButtonStyle.Success : DiscordJS.ButtonStyle.Secondary),
        new DiscordJS.ButtonBuilder()
            .setCustomId(`play_${id}_${nPlayers}_3_3`)
            .setLabel(matrice[2][2] == 0 ? '‎ ' : matrice[2][2] == 1 ? '❌' : '⭕')
            .setDisabled(win_moves[8] != null ? true : matrice[2][2] != 0 ? true : false)
            .setStyle(win_moves[8] ? DiscordJS.ButtonStyle.Success : DiscordJS.ButtonStyle.Secondary))
    return [row1, row2, row3]
}

function check_placement_tictactoe(matrice) {
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
    const win = check_placement_tictactoe(matrice)
    rows = create_buttons_tictactoe(game_interaction.id, nPlayers, matrice, win[1])
    if (win[0] > 0) {
        const embed = DiscordJS.EmbedBuilder.from(interaction.message.embeds[0])
            .setFooter({ text: null })
            .setColor(win[0] == 1 ? DiscordJS.Colors.Green : nPlayers == 2 ? DiscordJS.Colors.Green : DiscordJS.Colors.Red)
            .addFields([{name: 'Winner:', value: `${win[0] == 1 ? game_interaction.member : nPlayers == 1 ? client.user : game_interaction.options._hoistedOptions[1].user}!`}])
        await game_interaction.editReply({ embeds: [embed], components: rows })
        try {client.CacheInteractions.delete(game_interaction.id)} catch {}
        return true
    } else if (win[0] == -1) {
        const embed = DiscordJS.EmbedBuilder.from(interaction.message.embeds[0])
            .setFooter({text: null})
            .setColor(DiscordJS.Colors.Yellow)
            .addFields([{name: 'Winner:', value: 'No winner, it\'s a tie!'}])
        await game_interaction.editReply({ embeds: [embed], components: rows })
        try {client.CacheInteractions.delete(game_interaction.id)} catch {}
        return true
    } else {
        await game_interaction.editReply({ components: rows })
        return false
    }
}

function check_patterns_tictactoe(matrice, pattern) {
    for (i in matrice) if (JSON.stringify(matrice[i]) == JSON.stringify(pattern)) return [parseInt(i), parseInt(pattern.indexOf(0))]
    for (i in matrice) if (JSON.stringify([matrice[0][i], matrice[1][i], matrice[2][i]]) == JSON.stringify(pattern)) return [parseInt(pattern.indexOf(0)), parseInt(i)]
    if (JSON.stringify([matrice[0][0], matrice[1][1], matrice[2][2]]) == JSON.stringify(pattern)) return [parseInt(pattern.indexOf(0)), parseInt(pattern.indexOf(0))]
    if (JSON.stringify([matrice[2][0], matrice[1][1], matrice[0][2]]) == JSON.stringify(pattern)) return [parseInt(pattern.indexOf(0)) == 0 ? 2 : parseInt(pattern.indexOf(0)) == 1 ? 1 : 0 , parseInt(pattern.indexOf(0))]
    return null
}

function find_move_tictactoe(matrice, first) {
    patterns = [[2, 2, 0], [2, 0, 2], [0, 2, 2], [1, 1, 0], [1, 0, 1], [0, 1, 1]]
    for (p in patterns) if (check_patterns_tictactoe(matrice, patterns[p])) return check_patterns_tictactoe(matrice, patterns[p])
    if (matrice[0][0] == 2 && matrice[0][1] == 1 && matrice[2][0] == 0 && matrice[1][0] == 0 || matrice[2][2] == 2 && matrice[1][2] == 1 && matrice[2][0] == 0 && matrice[2][1] == 0) return [2, 0]
    if (matrice[0][0] == 2 && matrice[1][0] == 1 && matrice[0][2] == 0 && matrice[0][1] == 0 || matrice[2][2] == 2 && matrice[2][1] == 1 && matrice[0][2] == 0 && matrice[1][2] == 0) return [0, 2]
    if (matrice[0][2] == 2 && matrice[1][2] == 1 && matrice[0][0] == 0 && matrice[0][1] == 0 || matrice[2][0] == 2 && matrice[2][1] == 1 && matrice[0][0] == 0 && matrice[1][0] == 0) return [0, 0]
    if (matrice[0][2] == 2 && matrice[0][1] == 1 && matrice[2][2] == 0 && matrice[1][2] == 0 || matrice[2][0] == 2 && matrice[1][0] == 1 && matrice[2][2] == 0 && matrice[2][1] == 0) return [2, 2]
    patterns = [[2, 1, 0], [0, 1, 2]]
    for (p in patterns) if (check_patterns_tictactoe(matrice, patterns[p])) return check_patterns_tictactoe(matrice, patterns[p])
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
        if (matrice[2][1] == 1 && matrice[1][1] == 2 && matrice[1][2] == 0) return [1, 2]
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
    client.CacheInteractions.get(game_interaction.id).options._subcommand[0][y][x] = 1
    if (await check_win_tictactoe(client, interaction, game_interaction, client.CacheInteractions.get(game_interaction.id).options._subcommand[0])) return
    const bot = find_move_tictactoe(client.CacheInteractions.get(game_interaction.id).options._subcommand[0], client.CacheInteractions.get(game_interaction.id).options._subcommand[1])
    client.CacheInteractions.get(game_interaction.id).options._subcommand[0][bot[0]][bot[1]] = 2
    if (await check_win_tictactoe(client, interaction, game_interaction, client.CacheInteractions.get(game_interaction.id).options._subcommand[0])) return
}

async function multi_tictactoe(client, interaction, game_interaction, x, y) {
    client.CacheInteractions.get(game_interaction.id).options._subcommand[0][y][x] = game_interaction.options._subcommand[1] + 1
    client.CacheInteractions.get(game_interaction.id).options._subcommand[1] = game_interaction.options._subcommand[1] == 1 ? 0 : 1
    if (await check_win_tictactoe(client, interaction, game_interaction, client.CacheInteractions.get(game_interaction.id).options._subcommand[0], 2)) return
}

async function manage_tictactoe(client, interaction, game_interaction, response) {
    if (response[2] == '1') {
        if (interaction.user.id != game_interaction.user.id) {await interaction.editReply({content: 'It\'s not your game to play.'}); return false}
        await solo_tictactoe(client, interaction, game_interaction, parseInt(response[3]) - 1, parseInt(response[4]) - 1)
    }
    if (response[2] == '2') {
        if (interaction.user.id != game_interaction.user.id && interaction.user.id != game_interaction.options._hoistedOptions[1].user.id) {await interaction.editReply({content: 'It\'s not your game to play.'}); return false}
        if (parseInt(response[3]) > 0) {
            if (response.length == 4) {
                if (interaction.user.id != game_interaction.options._hoistedOptions[1].user.id) {await interaction.editReply({content: 'It\'s not your game to play.'}); return false}
                var first = Math.round(Math.random())
                const embed = new DiscordJS.EmbedBuilder()
                    .setTitle('Tic Tac Toe')
                    .setColor(DiscordJS.Colors.Blue)
                    .setFooter({ text: "Make your choice:"})
                    .addFields([
                        {name: 'Player ❌:', value: `${game_interaction.member}`},
                        {name: 'Player ⭕️:', value: `${game_interaction.options._hoistedOptions[1].member}`},
                        {name: 'First to play:', value: `${first == 0 ? '❌' : '⭕'}`}])
                const rows = create_buttons_tictactoe(game_interaction.id, 2, client.CacheInteractions.get(game_interaction.id).options._subcommand[0])
                client.CacheInteractions.get(game_interaction.id).options._subcommand[1] = first
                await game_interaction.editReply({ embeds: [embed], components: rows })
                return true
            } else {
                if (interaction.user.id == game_interaction.user.id && game_interaction.options._subcommand[1] == 1) {await interaction.editReply({content: 'It\'s not your turn.'}); return false}
                if (interaction.user.id == game_interaction.options._hoistedOptions[1].user.id && game_interaction.options._subcommand[1] == 0) {await interaction.editReply({content: 'It\'s not your turn.'}); return false}
                await multi_tictactoe(client, interaction, game_interaction, parseInt(response[3]) - 1, parseInt(response[4]) - 1)
                return true
            }
        } else {
            const embed = DiscordJS.EmbedBuilder.from(interaction.message.embeds[0])
                .setColor(DiscordJS.Colors.Red).setFooter({text: null})
                .addFields([{name: 'To bad!', value: `${interaction.member} don't want to play with you`}])
            await game_interaction.editReply({ embeds: [embed], components: [] })
            try {client.CacheInteractions.delete(game_interaction.id)} catch {}
            return true
        }
    }
    return true
}

async function start_tictactoe(client, interaction, options) {
    client.CacheInteractions.set(interaction.id, interaction)
    client.CacheInteractions.get(interaction.id).options._subcommand = [[[0, 0, 0], [0, 0, 0], [0, 0, 0]]]
    if (!options[1] || options[1].member.user.bot || options[1].user.id == interaction.user.id) {
        const first = Math.round(Math.random())
        const embed = new DiscordJS.EmbedBuilder()
            .setTitle('Tic Tac Toe')
            .setColor(DiscordJS.Colors.Blue)
            .setFooter({text: 'Make your choice:'})
            .addFields([
                {name: 'Player ❌:', value: `${interaction.member}`},
                {name: 'Player ⭕️:', value: `${client.user}`},
                {name: 'First to play:', value: `${first ? '❌' : '⭕️'}`}])
        if (!first) client.CacheInteractions.get(interaction.id).options._subcommand[0][Math.round(Math.random()) ? 0 : 2][Math.round(Math.random()) ? 0 : 2] = 2
        client.CacheInteractions.get(interaction.id).options._subcommand[1] = first
        const rows = create_buttons_tictactoe(interaction.id, 1, client.CacheInteractions.get(interaction.id).options._subcommand[0])
        await interaction.editReply({embeds: [embed], components: rows})
    } else {
        const embed = new DiscordJS.EmbedBuilder()
            .setTitle('Tic Tac Toe')
            .setColor(DiscordJS.Colors.Blue)
            .setFooter({text: "Make your choice:"})
            .addFields([
                {name: 'Players :', value: `${interaction.member} vs ${options[1].member}`},
                {name: 'Do you accept the challenge?', value: `${options[1].member}`}])
        const row = new DiscordJS.ActionRowBuilder().addComponents(
            new DiscordJS.ButtonBuilder()
                .setCustomId(`play_${interaction.id}_2_1`)
                .setLabel('Yes')
                .setStyle(DiscordJS.ButtonStyle.Success),
            new DiscordJS.ButtonBuilder()
                .setCustomId(`play_${interaction.id}_2_0`)
                .setLabel('Nope')
                .setStyle(DiscordJS.ButtonStyle.Danger),
        )
        await interaction.editReply({embeds: [embed], components: [row]})
    }
}
// End of TicTacToe

module.exports = {
    test: false,
    data: new DiscordJS.SlashCommandBuilder()
        .setName('play')
        .setDescription('Want to play some games?')
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('game')
            .setDescription('The game you want to play')
            .setRequired(true)
            .addChoices(
                {name: 'shifumi', value: 'shifumi'},
                {name: 'tic-tac-toe', value: 'tictactoe'}))
        .addUserOption(option => option
            .setName('user')
            .setDescription('A user you want to play against')
            .setRequired(false)),
    async execute({client, interaction, options}) {
        try {
            if (interaction.isCommand()) {
                await interaction.deferReply()
                if (options[0].value == 'shifumi') await start_shifumi(client, interaction, options)
                else if (options[0].value == 'tictactoe') await start_tictactoe(client, interaction, options)
            } else if (interaction.isButton()) {
                await interaction.deferReply({ephemeral: true})
                var del = true
                const response = interaction.customId.split('_')
                game_interaction = client.CacheInteractions.get(response[1])
                if (!game_interaction) return await interaction.editReply({content: 'This game has expired.'})
                if (game_interaction.options._hoistedOptions[0].value == 'shifumi') del = await manage_shifumi(client, interaction, game_interaction, response)
                else if (game_interaction.options._hoistedOptions[0].value == 'tictactoe') del = await manage_tictactoe(client, interaction, game_interaction, response)
                try {if (del) await interaction.deleteReply()} catch {}
            }
        } catch (e) {console.error('Error in /play:', e)}
    }
}