const DiscordJS = require('discord.js');
const colors = require("./colors.json");
require('dotenv').config({ path: './config/.env' })

const guildIds = ['702461452564430948'];
const client = new DiscordJS.Client();
const prefix = 'c!';

client.commands = new DiscordJS.Collection();
client.admcommands = new DiscordJS.Collection();
client.slhcommands = new DiscordJS.Collection();
["command"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

const get_app = (guildId => {
    const app = client.api.applications(client.user.id)
    if (guildId) {app.guilds(guildId)}
    return app
})

client.ws.on('INTERACTION_CREATE', async (interaction) => {
    const name = interaction.data.name

    let args = []
    for (i in interaction.data.options) {args.push(interaction.data.options[i].value)}
    if (!interaction.data.options) {args = ['']}

    const res = await client.slhcommands.get(name).callback({client, interaction, args})

    let data = {content: res}
    if (typeof res === 'object') {data = await create_api_msg(interaction, res)}

    client.api.interactions(interaction.id, interaction.token).callback.post({data: {type: 4, data}})
})

const create_api_msg = async (interaction, embed) => {
    const {data, files} = await DiscordJS.APIMessage.create(client.channels.resolve(interaction.channel_id), embed)
    .resolveData()
    .resolveFiles()
    return {...data, files}
}

client.on('ready', async () => {
    try {
        client.slhcommands.forEach(element => {
            if (element.test) {
                guildIds.forEach(id => {
                    get_app(id).commands.post({data: {
                        name: element.name,
                        description: element.description,
                        options: element.args,
                    }})
                })
                console.log(`Loaded ${element.name} as a test`);
            } else {
                get_app().commands.post({data: {
                    name: element.name,
                    description: element.description,
                    options: element.args,
                }})
                console.log(`Loaded ${element.name} as a cmd`);
            }
        });
    } catch {console.log("Err in slash loading");}

    console.log('Getting loaded list...');
    let commands
    for (i in guildIds) {
        commands = await get_app(guildIds[i]).commands.get().catch(() => {console.log("no commands")})
        for (y in commands) {console.log("Test   cmd's", y, [commands[y].id, commands[y].name])}}
    commands = await get_app().commands.get().catch(() => {console.log("no commands")})
    for (i in commands) {console.log("Global cmd's", i, [commands[i].id, commands[i].name])}

    client.user.setActivity('you👀', { type: 'WATCHING' })
    console.log("client Ready\n")
})

client.on('message', async message => {
    const clientid1 = `<@!${client.user.id}>`
    const clientid2 = `<@${client.user.id}>`

    if (message.author.id == client.user.id && message.content.startsWith("I deleted ")) {message.delete({timeout:3000}).catch()}
    if (!message.content.startsWith(prefix)
    &&  !message.content.startsWith(clientid1)
    &&  !message.content.startsWith(clientid2)) return;

    let args;
    if      (message.content.startsWith(clientid1)) {args = message.content.slice(clientid1.length).trim().split(/ +/g);}
    else if (message.content.startsWith(clientid2)) {args = message.content.slice(clientid2.length).trim().split(/ +/g);}
    else {args = message.content.slice(prefix.length).trim().split(/ +/g);}

    let commandsName = args.shift().toLowerCase();
    if (commandsName.length === 0) {message.reply("Say something you mother f***").catch(); message.delete(); return;}

    const command = client.commands.get(commandsName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandsName));
    const admcommand = client.admcommands.get(commandsName) || client.admcommands.find(cmd => cmd.aliases && cmd.aliases.includes(commandsName));

    if (message.author.id != client.user.id) {
        if (!admcommand) {message.reply(`**${commandsName}** is not a command`).catch(); message.delete(); return;}
        if (admcommand) admcommand.run(client, message, args);
        message.delete().catch();
    } else {
        if (!command) {message.channel.send(`**${commandsName}** is not a command`).catch(); message.delete(); return;}
        if (command) command.run(client, message, args);
    }
})

client.on("voiceStateUpdate", (oldMember, newMember) => {
    let oldV = oldMember.channel;
    let newV = newMember.channel;
    const log = client.guilds.cache.get(newMember.guild.id).channels.cache.find(chan => chan.name === "📜log📜" && chan.type === "text");
    const botlog = client.guilds.cache.get(newMember.guild.id).channels.cache.find(chan => chan.name === "🚧bot_log🚧" && chan.type === "text");
    if (!log) {return}
    if (!botlog) {return}
    var embed = new DiscordJS.MessageEmbed().setTitle("Clumsy Logs").setTimestamp()
    .setThumbnail(client.users.cache.get(newMember.id).avatarURL({ dynamic: true, format: 'png', size: 64 }))

    if (oldV != newV) {
        if (oldV == null) {
            embed.setColor(colors.green)
            .setDescription(`📥${newMember.member} **joined\nchannel:** \`${newV.name}\``)
        } else if (newV == null) {
            embed.setColor(colors.red)
            .setDescription(`📤${newMember.member} **left\nchannel:** \`${oldV.name}\``)
            botlog.send(`<@!${client.user.id}> delete_channels ${newMember.guild.id}`)
        } else {
            embed.setColor(colors.yellow)
            .setDescription(`✈️${newMember.member} **mouved\nfrom:** \`${oldV.name}\` **\nto:** \`${newV.name}\``)
        }
        log.send(embed);
    }
});

client.on('guildMemberAdd', member =>{
    const log = client.guilds.cache.get(member.guild.id).channels.cache.find(chan => chan.name === "📜log📜" && chan.type === "text");
    if (!log) {return}
    const main = client.guilds.cache.get(member.guild.id).channels.cache.find(chan => chan.name === "🌈💩fuck💩🌈" && chan.type === "text");
    if (!main) {return}
    const wel = new DiscordJS.MessageEmbed().setTitle("Welcome").setColor(colors.green).setTimestamp()
    .setThumbnail(client.users.cache.get(member.id).avatarURL({ dynamic: true, format: 'png', size: 64 }))
    .setDescription(`Hey ${member}, welcome to **${member.guild}**!`)
    const embed = new DiscordJS.MessageEmbed().setTitle("Clumsy Logs").setTimestamp()
    .setColor(colors.green).setDescription(`✅${member} **joined the server**`)
    .setThumbnail(client.users.cache.get(member.id).avatarURL({ dynamic: true, format: 'png', size: 64 }))
    if (!member.user.bot) {
        member.createDM().then(channel => {
            channel.send(`Bienvenu ${member} dans mon serveur **${member.guild}** !!😄\nIci tu es le bienvenu avec tous tes amis.😜\nTu peux inviter qui tu veux, quand tu veux!🤗\nSi tu veux faire un vocal, utilise les commandes / et tu auras un channel rien que pour toi et tes potes!🤩\nDes questions ou des suggestions?? je suis la!!👍`);
        })
    }
    main.send(wel);
    log.send(embed);
})

client.on('guildMemberRemove', member =>{
    const log = client.guilds.cache.get(member.guild.id).channels.cache.find(chan => chan.name === "📜log📜" && chan.type === "text");
    if (!log) {return}
    const main = client.guilds.cache.get(member.guild.id).channels.cache.find(chan => chan.name === "🌈💩fuck💩🌈" && chan.type === "text");
    if (!main) {return}
    main.send(`Goodbye ${member}, have a great time!`);
    const embed = new DiscordJS.MessageEmbed().setTitle("Clumsy Logs").setTimestamp()
    .setColor(colors.red).setDescription(`❌${member} **left the server**`)
    .setThumbnail(client.users.cache.get(member.id).avatarURL({ dynamic: true, format: 'png', size: 64 }))
    log.send(embed);
})

client.login(process.env.TOKEN)