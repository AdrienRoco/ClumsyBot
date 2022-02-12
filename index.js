const DiscordJS = require('discord.js');
const colors = require("./colors.json");
require('dotenv').config({ path: './config/.env' })

const guild_test_ids = ['702461452564430948'];
const client_test_Id = '698480016207642644';
const client = new DiscordJS.Client();

client.botcommands = new DiscordJS.Collection();
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
    try {
        const name = interaction.data.name

        let args = []
        for (i in interaction.data.options) {args.push(interaction.data.options[i].value)}
        if (!interaction.data.options) {args = ['']}

        const tmp = await client.slhcommands.get(name).callback({client, interaction, args})
        const res = !tmp ? "Slash didn't return anything" : tmp

        let data = {content: res}
        if (typeof res === 'object') {data = await create_api_msg(interaction, res)}

        client.api.interactions(interaction.id, interaction.token).callback.post({data: {type: 4, data}})
    } catch {return}
})

const create_api_msg = async (interaction, embed) => {
    const {data, files} = await DiscordJS.APIMessage.create(client.channels.resolve(interaction.channel_id), embed)
    .resolveData()
    .resolveFiles()
    return {...data, files}
}

client.on('ready', async () => {
    try {
        if (client.user.id == client_test_Id) {
            client.slhcommands.forEach(element => {
                if (element.test) {
                    guild_test_ids.forEach(id => {
                        get_app(id).commands.post({data: {
                            name: element.name,
                            description: element.description,
                            options: element.args,
                        }})
                    })
                    console.log(`Loaded ${element.name} as a test`);
                }
            });
        } else {
            client.slhcommands.forEach(element => {
                if (!element.test) {
                    get_app().commands.post({data: {
                        name: element.name,
                        description: element.description,
                        options: element.args,
                    }})
                    console.log(`Loaded ${element.name} as a cmd`);
                }
            });
        }
    } catch {console.log("Err in slash loading");}

    console.log('Getting slash list...');
    let commands
    for (i in guild_test_ids) {
        commands = await get_app(guild_test_ids[i]).commands.get().catch(() => {console.log("no commands")})
        for (y in commands) {console.log("Test   cmd's", y, [commands[y].id, commands[y].name])}}
    commands = await get_app().commands.get().catch(() => {console.log("no commands")})
    for (i in commands) {console.log("Global cmd's", i, [commands[i].id, commands[i].name])}

    client.user.setActivity('you👀', { type: 'WATCHING' })
    console.log(`\n${client.user.username} Ready\n`)
})

client.on('message', message => {
    const clientid1 = `<@${client.user.id}>`
    const clientid2 = `<@!${client.user.id}>`

    if (message.author.id == client.user.id && message.content.startsWith("I deleted ")) {message.delete({timeout:3000}).catch()}
    if (!message.content.startsWith(clientid1) && !message.content.startsWith(clientid2)) return;
    if (message.author.bot) return;

    let args;
    if      (message.content.startsWith(clientid1)) {args = message.content.slice(clientid1.length).trim().split(/ +/g);}
    else if (message.content.startsWith(clientid2)) {args = message.content.slice(clientid2.length).trim().split(/ +/g);}

    let commandName = args.shift().toLowerCase();
    if (!commandName) {message.reply("What the f*** do you want???").catch(); message.delete(); return;}

    const botcommand = client.botcommands.get(commandName)

    if (!botcommand) {message.channel.send(`**${commandName}** is not a command`).catch(); message.delete(); return;}
    if (botcommand) try {botcommand.run(client, message, args)} catch {return}
})

client.on("voiceStateUpdate", (oldMember, newMember) => {
    let oldV = oldMember.channel;
    let newV = newMember.channel;
    if (oldV != newV) {
        if (newV == null) {
            if (oldV.members.size == 0)
                try {client.botcommands.get('delete_channels').run(newMember.guild)} catch {}
        } else if (oldV != null) {
            if (oldV.members.size == 0)
                try {client.botcommands.get('delete_channels').run(newMember.guild)} catch {}
        }
    }
});

client.on('guildMemberAdd', member =>{
    const main = client.guilds.cache.get(member.guild.id).channels.cache.get(member.guild.systemChannelID);
    if (!main) {return}
    const wel = new DiscordJS.MessageEmbed().setTitle("Welcome").setColor(colors.green).setTimestamp()
    .setThumbnail(client.users.cache.get(member.id).avatarURL({ dynamic: true, format: 'png', size: 64 }))
    .setDescription(`Hey ${member}, welcome to **${member.guild}**!`)
    if (!member.user.bot) {
        try {
            member.roles.add(client.guilds.cache.get(member.guild.id).roles.cache.find(r => r.name === "Online").id)
            member.roles.add(client.guilds.cache.get(member.guild.id).roles.cache.find(r => r.name === "⁣⁣         Games         ⁣⁣⁣⁣").id)
        } catch {}
        member.createDM().then(channel => {
            channel.send(`Bienvenu ${member} dans mon serveur **${member.guild}** !!😄\nIci tu es le bienvenu avec tous tes amis.😜\nTu peux inviter qui tu veux, quand tu veux!🤗\nSi tu veux faire un vocal, utilise les commandes / et tu auras un channel rien que pour toi et tes potes!👍`);
        })
    }
    main.send(wel);
})

client.on('guildMemberRemove', member =>{
    const main = client.guilds.cache.get(member.guild.id).channels.cache.get(member.guild.systemChannelID);
    if (!main) {return}
    const embed = new DiscordJS.MessageEmbed().setTitle("Goodbye").setColor(colors.red).setTimestamp()
    .setThumbnail(client.users.cache.get(member.id).avatarURL({ dynamic: true, format: 'png', size: 64 }))
    .setDescription(`Goodbye ${member}, have a great time!`)
    main.send(embed);
})

client.login(process.env.TOKEN)