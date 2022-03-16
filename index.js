const DiscordJS = require('discord.js');
const colors = require("./colors.json");
const fs = require("fs");
require('dotenv').config({ path: './config/.env' })

const guild_test_ids = ['702461452564430948'];
const client = new DiscordJS.Client({ intents: 32767 });

client.botcommands = new DiscordJS.Collection();
client.slhcommands = new DiscordJS.Collection();
client.gamesinteractions = new DiscordJS.Collection();
["command"].forEach(async handler => {
    await require(`./handlers/${handler}`)(client);
});

var guilds_settings = {}
async function read_conf() {
    const rawdata = fs.readFileSync('./config/guilds_settings.json');
    const conf = JSON.parse(rawdata);
    return conf;
}

const get_app = (guildId => {
    const app = client.api.applications(client.user.id)
    if (guildId) {app.guilds(guildId)}
    return app
})

client.on('ready', async () => {
    try {
        client.slhcommands.forEach(element => {
            if (!element.test) {
                get_app().commands.post({data: {
                    name: element.name,
                    description: element.description,
                    options: element.args,
                }})
                console.log(`Loaded ${element.name} as a cmd`);
            }
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

async function command_reply(interaction, res) {
    try {
        if (typeof res == 'string') {
            await interaction.deleteReply()
            await interaction.followUp({ content: res, ephemeral: true })
            return
        }
        if (typeof res == 'object') {
            if (res.ephemeral) {
                await interaction.deleteReply()
                await interaction.followUp(res)
                return
            } else {
                await interaction.editReply(res)
                return
            }
        }
        await interaction.deleteReply()
        await interaction.followUp({ content: "Unhandled response type, ask admin if persistent", ephemeral: true })
        throw new Error('Unhandled response type')
    } catch (e) {console.log('Error in command_reply:', e); return}
}

client.on('interactionCreate', async (interaction) => {
    try {
        var res;
        // Selection menu management
        if (interaction.isSelectMenu()) {
            await interaction.deferReply()
            res = await client.slhcommands.get(interaction.customId.split('_')[0]).callback({ client, interaction })
            if (!res) {command_reply(interaction, { content: "Oups, I can't do that. Ask admin if persistent", ephemeral: true }); return}
            if (res == true) {return}
        }
        // Button management
        else if (interaction.isButton()) {
            await interaction.deferReply()
            res = await client.slhcommands.get(interaction.customId.split('_')[0]).callback({ client, interaction })
            if (!res) {command_reply(interaction, { content: "Oups, I can't do that. Ask admin if persistent", ephemeral: true }); return}
            if (res == true) {return}
        }
        // Slash command management
        else if (interaction.isCommand()) {
            if (interaction.commandName != 'nuke') await interaction.deferReply()
            const args = interaction.options._hoistedOptions.length == 0 ? [''] : interaction.options._hoistedOptions
            res = await client.slhcommands.get(interaction.commandName).callback({ client, interaction, args })
            if (!res) {command_reply(interaction, { content: "Oups, I can't do that. Ask admin if persistent", ephemeral: true }); return}
            if (interaction.commandName == 'nuke') {await interaction.reply({ content: res, ephemeral: true }); return}
        }
        command_reply(interaction, res)
    } catch (e) {console.log('Error in interactionCreate:', e); return command_reply(interaction, { content: "Oups, I can't do that. Ask admin if persistent", ephemeral: true })}
})

client.on('messageCreate', async message => {
    try {
        const clientid1 = `<@${client.user.id}>`
        const clientid2 = `<@!${client.user.id}>`

        if (!message.content.startsWith(clientid1) && !message.content.startsWith(clientid2)) return;
        if (message.author.bot) return;

        let args;
        if      (message.content.startsWith(clientid1)) {args = message.content.slice(clientid1.length).trim().split(/ +/g);}
        else if (message.content.startsWith(clientid2)) {args = message.content.slice(clientid2.length).trim().split(/ +/g);}

        let commandName = args.shift().toLowerCase();
        if (!commandName) {message.reply({ content: "What the f*** do you want???" }).catch(); return;}

        const botcommand = client.botcommands.get(commandName)

        if (!botcommand) {message.reply({ content: `**${commandName}** is not a command` }).catch(); return;}
        if (botcommand) try {
            botcommand.run({ client, message, args })
            message.delete()
        } catch {return}
    } catch (e) {console.log('Error in messageCreate:', e); return}
})

client.on("voiceStateUpdate", async (oldMember, newMember) => {
    if (oldMember.channel != newMember.channel && newMember.channel == null && oldMember.channel.members.size == 0)
        try {await client.botcommands.get('delete').run({ client })} catch {}
});

client.on('guildMemberAdd', async member => {
    const guild = client.guilds.cache.get(member.guild.id);
    const main = guild.channels.cache.get(guild.systemChannelId);
    guilds_settings = await read_conf()
    var wel_msg, dm_msg, roles_list;
    try {wel_msg = guilds_settings[member.guild.id].welcome_message} catch {wel_msg = true}
    try {dm_msg = guilds_settings[member.guild.id].dm_message} catch {dm_msg = true}
    try {roles_list = guilds_settings[member.guild.id].default_roles} catch {roles_list = []}
    if (wel_msg && main) {
        const wel = new DiscordJS.MessageEmbed().setTitle("Welcome").setColor(colors.green).setTimestamp()
        .setThumbnail(client.users.cache.get(member.id).avatarURL({ dynamic: true, format: 'png', size: 64 }))
        .setDescription(`Hey ${member}, welcome to **${member.guild}**!`)
        main.send({ embeds: [wel] });
    }
    if (!member.user.bot) {
        if (roles_list[0]) {
            for (i in roles_list) {
                if (guild.roles.cache.map(role => role).filter(role => role.tags && role.tags.botId == client.user.id)[0].rawPosition > guild.roles.cache.get(roles_list[i]).rawPosition)
                    try {await member.roles.add(guild.roles.cache.get(roles_list[i]))} catch (e) {console.log('Error in GuildMemberAdd:', e)}
            }
        }
        if (dm_msg) {
            member.createDM().then(channel => {
                channel.send({ content: `Bienvenu ${member} dans mon serveur **${member.guild}** !!😄\nIci tu es le bienvenu avec tous tes amis.😜\nTu peux inviter qui tu veux, quand tu veux!🤗\nSi tu veux faire un vocal, utilise les commandes / et tu auras un channel rien que pour toi et tes potes!👍` });
            })
        }
    }
})

client.on('guildMemberRemove', async member => {
    const guild = client.guilds.cache.get(member.guild.id);
    const main = guild.channels.cache.get(guild.systemChannelId);
    if (!main) {return}
    guilds_settings = await read_conf()
    var wel_msg;
    try {wel_msg = guilds_settings[member.guild.id].welcome_message} catch {wel_msg = true}
    if (wel_msg) {
        const embed = new DiscordJS.MessageEmbed().setTitle("Goodbye").setColor(colors.red).setTimestamp()
        .setThumbnail(client.users.cache.get(member.id).avatarURL({ dynamic: true, format: 'png', size: 64 }))
        .setDescription(`Goodbye \`${member.user.username}#${member.user.discriminator}\`, have a great time!`)
        main.send({embeds: [embed]});
    }
})

client.login(process.env.TOKEN)