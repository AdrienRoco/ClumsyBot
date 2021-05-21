const { MessageEmbed } = require("discord.js");
const colors = require("../../colors.json");

function wait(ms) {
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
        end = new Date().getTime();
    }
}

async function promptMessage(message, author, time, validReactions, player) {
    // We put in the time as seconds, with this it's being transfered to MS
    time *= 1000;
    // For every emoji in the function parameters, react in the good order.
    for (const reaction of validReactions) await message.react(reaction);
    // Only allow reactions from the author, and the emoji must be in the array we provided.
    if (!player) {
        const filter = (reaction, user) => validReactions.includes(reaction.emoji.name) && user.id === author.id;
        return message.awaitReactions(filter, { max: 1, time: time}).then(collected => collected.first() && collected.first().emoji.name);
    } else {
        const filter = (reaction, user) => validReactions.includes(reaction.emoji.name) && user.id === author.id || user.id === player.id;
        return message.awaitReactions(filter, { max: 1, time: time}).then(collected => collected.first() && collected.first().emoji.name);
    }
    // And ofcourse, await the reactions
}

function getResult(me, clientChosen) {
    if ((me === "👊" && clientChosen === "✌️") || (me === "✋" && clientChosen === "👊") || (me === "✌️" && clientChosen === "✋"))
    return 1;
    else if (me === clientChosen)
    return 0;
    else if ((me === "✌️" && clientChosen === "👊") || (me === "👊" && clientChosen === "✋") || (me === "✋" && clientChosen === "✌️"))
    return 2;
    else
    return 84;
}

async function multy(bot, author, message, args, embed, embed1, embed2, chooseArr, mention, m, m1, m2) {
    await m.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
    embed.setDescription(`Waiting for ${author} to play!`)
    embed1.setColor(colors.blue).setFooter('Make your choice:');
    m.edit(embed); m1.edit(embed1);
    // ----------------------------------------------------------------------------------------------------------------------------------------------- //
    const p1 = await promptMessage(m1, author, 20, chooseArr);
    await m1.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
    if (!p1) {
        embed1.setColor(colors.red).addField("Fuck!", "You didn't play").setFooter("").setDescription("");
        embed2.setColor(colors.red).addField("Fuck!", `${author} didn't play`).setFooter("").setDescription("");
        embed.setColor(colors.red).addField("Fuck!", `${author} didn't play`).setFooter("").setDescription("");
        m1.edit(embed1); m2.edit(embed2); m.edit(embed);
        return;
    }
    embed.setDescription(`Waiting for ${mention} to play!`)
    embed1.setColor(colors.orange).setFooter('Waiting for the other player...')
    embed2.setColor(colors.blue).setFooter('Make your choice:');
    m.edit(embed);
    m1.edit(embed1);
    m2.edit(embed2);
    const p2 = await promptMessage(m2, mention, 20, chooseArr);
    await m2.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
    if (!p2) {
        embed1.setColor(colors.red).addField("Fuck!", `${mention} didn't play`).setFooter("").setDescription("");
        embed2.setColor(colors.red).addField("Fuck!", "You didn't play").setFooter("").setDescription("");
        embed.setColor(colors.red).addField("Fuck!", `${mention} didn't play`).setFooter("").setDescription("");
        m1.edit(embed1); m2.edit(embed2); m.edit(embed);
        return;
    }
    // ----------------------------------------------------------------------------------------------------------------------------------------------- //
    var result = getResult(p1, p2);
    if (result === 1) {
        embed.setColor(colors.green); embed.addField("Wow!", `${p1} vs ${p2}`).setFooter("").setDescription(`${author} Won!`);
        embed1.setColor(colors.green).addField("Wow!", `${p1} vs ${p2}`).setFooter("").setDescription("You won!");
        embed2.setColor(colors.red).addField("Fuck!", `${p1} vs ${p2}`).setFooter("").setDescription("You lost!");
        await m1.edit(embed1); await m2.edit(embed2); await m.edit(embed);
        return;
    }
    if (result === 0) {
        embed.setColor(colors.yellow); embed.addField("Oh!", `${p1} vs ${p2}`).setFooter("Play again?").setDescription(`It's a tie!`);
        embed1.setColor(colors.yellow).addField("Oh!", `${p1} vs ${p2}`).setFooter("").setDescription(`It's a tie!`);
        embed2.setColor(colors.yellow).addField("Oh!", `${p1} vs ${p2}`).setFooter("").setDescription(`It's a tie!`);
        m1.edit(embed1); m2.edit(embed2); m.edit(embed);
        const redo = await promptMessage(m, author, 20, ["🔄"], mention)
        await m.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
        await m1.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
        await m2.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
        if (!redo) {embed.setFooter(""); m.edit(embed); return}
        else {
            embed.setColor(colors.blue)
            .setTitle('Rock Paper Scissor')
            .setFooter("");
            embed2.setColor(colors.orange).setFooter('Waiting for the other player...')
            m.edit(embed); m2.edit(embed2);
            await multy(bot, author, message, args, embed, embed1, embed2, chooseArr, mention, m, m1, m2);
        }
        return;
    }
    if (result === 2) {
        embed.setColor(colors.green); embed.addField("Wow!", `${p1} vs ${p2}`).setFooter("").setDescription(`${mention} Won!`);
        embed1.setColor(colors.red).addField("Fuck!", `${p1} vs ${p2}`).setFooter("").setDescription("You lost!");
        embed2.setColor(colors.green).addField("Wow!", `${p1} vs ${p2}`).setFooter("").setDescription("You won!");
        await m1.edit(embed1); await m2.edit(embed2); await m.edit(embed);
        return;
    }
}

async function solo(bot, author, message, args, embed, chooseArr, m) {
    const react = await promptMessage(m, author, 10, chooseArr);
    const bot_choice = chooseArr[Math.floor(Math.random() * chooseArr.length)];
    var result = getResult(react, bot_choice);
    await m.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
    if (result === 1) {result = "You won!"; embed.setColor(colors.green); embed.addField(result, `${react} vs ${bot_choice}`).setFooter("");}
    else if (result === 0) {result = "It's a tie!"; embed.setColor(colors.yellow); embed.addField(result, `${react} vs ${bot_choice}`).setFooter("Play again?");}
    else if (result === 2) {result = "You lost!"; embed.setColor(colors.red); embed.addField(result, `${react} vs ${bot_choice}`).setFooter("");}
    else {result = "Fuck!"; embed.setColor(colors.red).addField(result, "You didn't play").setFooter("");}
    m.edit(embed);
    if (result != "It's a tie!") return;
    const redo = await promptMessage(m, author, 5, ["🔄"])
    if (!redo) {embed.setFooter(""); m.edit(embed); await m.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error)); return}
    else {
        await m.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
        embed.setColor(colors.blue)
        .setTitle('Rock Paper Scissor')
        .setFooter('Make your choice:');
        m.edit(embed);
        solo(bot, author, message, args, embed, chooseArr, m)
    }
}

module.exports = {
    name: "rps",
    run: async (bot, message, args) => {
        const author = message.mentions.users.each(user => user)
        .filter(user => !user.bot).first()
        const mention = message.mentions.users.each(user => user)
        .filter(user => !user.bot).last()
        const mchan = bot.channels.cache.get(args[args.length - 1])
        if (!mchan) {return}
        let gm = true;
        if (!mention || author === mention) {gm = false}
        const chooseArr = ["👊", "✋", "✌️"];
        var embed = new MessageEmbed()
        .setColor(colors.blue)
        .setTitle('Rock Paper Scissor')
        .setFooter('Make your choice:');
        if (gm) {
            var embed1 = new MessageEmbed().setColor(colors.blue).setTitle('Rock Paper Scissor').setFooter('Make your choice:').addField('Players :', `${author} and ${mention}`);
            var embed2 = new MessageEmbed().setColor(colors.orange).setTitle('Rock Paper Scissor').setFooter('Waiting for the other player...').addField('Players :', `${author} and ${mention}`);
            embed.addField('Players :', `${author} and ${mention}`).addField(`Do you accepte the challenge?`, `${mention}`);
            const m = await mchan.send(embed)
            const react = await promptMessage(m, mention, 25, ["✔️", "❌"])
            embed.fields = [];
            embed.addField('Players :', `${author} and ${mention}`);
            if (react === "❌" || !react) {
                embed.setColor(colors.red).setFooter("").addField("Fuck!", `${mention} don't want to play with you`);
                await m.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error)); m.edit(embed);
                return;
            }
            else if (react === "✔️") {embed.setColor(colors.orange).setFooter("").setDescription("")}
            let m1; let m2; var idp1; var idp2; var ch1; var ch2;
            var ch_name = '🗿📃✂️';
            rps_category = bot.guilds.cache.get(message.guild.id).channels.cache.find(chan => chan.name === "Rock Paper Scissor" && chan.type === "category");
            await message.guild.channels.create(`${ch_name}`, {type: 'text', parent: rps_category.id, permissionOverwrites: [{
                id: author.id, allow: 66560}, {id: message.guild.roles.everyone, deny: 2146958847}]
            }).then(async chan => {chan.send(`${author}`).then(m => {m.delete()}); m1 = await chan.send(embed1); idp1 = chan.id})
            await message.guild.channels.create(`${ch_name}`, {type: 'text', parent: rps_category.id, permissionOverwrites: [{
                id: mention.id, allow: 66560}, {id: message.guild.roles.everyone, deny: 2146958847}]
            }).then(async chan => {chan.send(`${mention}`).then(m => {m.delete()}); m2 = await chan.send(embed2); idp2 = chan.id})
            await multy(bot, author, message, args, embed, embed1, embed2, chooseArr, mention, m, m1, m2);
            ch1 = bot.channels.cache.get(idp1); ch2 = bot.channels.cache.get(idp2);
            wait(2500);
            if (ch1) {await ch1.delete()}
            if (ch2) {await ch2.delete()}
        } else {
            embed.addField('Player :', `${author}`)
            const m = await mchan.send(embed)
            solo(bot, author, message, args, embed, chooseArr, m)
        }
    }
}