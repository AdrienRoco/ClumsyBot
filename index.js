require('dotenv').config({ path: './config/.env' });
const guilds_settings = require('./configuration.js');
const temp_channels = require('./channels.js');
const DiscordJS = require('discord.js');
const fs = require('fs');
const guild_test_ids = process.env.TEST_IDS.split(',');
const client = new DiscordJS.Client({ intents: 3276799 });
const rest = new DiscordJS.REST({ version: '10' }).setToken(process.env.TOKEN);

// client.botCommands = new DiscordJS.Collection();
client.Commands = new DiscordJS.Collection();
// client.gamesInteractions = new DiscordJS.Collection();

client.on('ready', async () => {
    await guilds_settings.load()
    await temp_channels.load()

    const commands_test = [];
    const commands_main = [];
    const commandFiles = fs.readdirSync("./cmd").filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./cmd/${file}`);
        if (command.test) commands_test.push(command.data.toJSON());
        else commands_main.push(command.data.toJSON());
        if ('data' in command && 'execute' in command) client.Commands.set(command.data.name, command);
        else console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
    await (async () => {
        try {
            console.log(`Started refreshing ${commands_test.length} guilds (/) commands.`);
            guild_test_ids.forEach(async element => {
                await rest.put(
                    DiscordJS.Routes.applicationGuildCommands(client.user.id, element),
                    { body: commands_test },
                );
            });
            console.log(`Started refreshing ${commands_main.length} application (/) commands.`);
            await rest.put(
                DiscordJS.Routes.applicationCommands(client.user.id),
                { body: commands_main },
            );
            console.log(`Successfully reloaded all (/) commands.`);
        } catch (e) {console.error('Error in cmds loading:', e)}
    })();
    client.user.setActivity('you👀', { type: DiscordJS.ActivityType.Watching })
    console.log(`\n${client.user.username} Ready\n`)
})

client.on(DiscordJS.Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.Commands.get(interaction.commandName);
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}
	try {
        const options = interaction.options._hoistedOptions;
		await command.execute({client, interaction, options});
	} catch (error) {
		console.error(`Error executing ${interaction.commandName}`);
		console.error(error);
	}
});

// async function command_reply(interaction, res) {
//     try {
//         if (typeof res == 'string') {
//             await interaction.deleteReply()
//             await interaction.followUp({ content: res, ephemeral: true })
//             return
//         }
//         if (typeof res == 'object') {
//             if (res.ephemeral) {
//                 await interaction.deleteReply()
//                 await interaction.followUp(res)
//                 return
//             } else {
//                 await interaction.editReply(res)
//                 return
//             }
//         }
//         await interaction.deleteReply()
//         await interaction.followUp({ content: "Unhandled response type, ask admin if persistent", ephemeral: true })
//         throw new Error('Unhandled response type')
//     } catch (e) {console.error('Error in command_reply:', e); return}
// }

// client.on('interactionCreate', async (interaction) => {
//     try {
//         console.log(interaction.commandName)
//         var res;
//         // Selection menu management
//         if (interaction.isStringSelectMenu()) {
//             await interaction.deferReply()
//             res = await client.Commands.get(interaction.commandName).execute(interaction)
//             if (!res) {command_reply(interaction, { content: "Oups, I can't do that. Ask admin if persistent", ephemeral: true }); return}
//             if (res == true) {return}
//         }
//         // Button management
//         else if (interaction.isButton()) {
//             await interaction.deferReply()
//             res = await client.slhCommands.get(interaction.customId.split('_')[0]).callback({ client, interaction })
//             if (!res) {command_reply(interaction, { content: "Oups, I can't do that. Ask admin if persistent", ephemeral: true }); return}
//             if (res == true) {return}
//         }
//         // Slash command management
//         else if (interaction.isCommand()) {
//             if (interaction.commandName != 'nuke') await interaction.deferReply()
//             const args = interaction.options._hoistedOptions.length == 0 ? [''] : interaction.options._hoistedOptions
//             res = await client.slhCommands.get(interaction.commandName).callback({ client, interaction, args })
//             if (!res) {command_reply(interaction, { content: "Oups, I can't do that. Ask admin if persistent", ephemeral: true }); return}
//             if (interaction.commandName == 'nuke') {await interaction.reply({ content: res, ephemeral: true }); return}
//         }
//         command_reply(interaction, res)
//     } catch (e) {console.error('Error in interactionCreate:', e); return command_reply(interaction, { content: "Oups, I can't do that. Ask admin if persistent", ephemeral: true })}
// })

// client.on('messageCreate', async message => {
//     try {
//         const clientId1 = `<@${client.user.id}>`
//         const clientId2 = `<@!${client.user.id}>`

//         if (!message.content.startsWith(clientId1) && !message.content.startsWith(clientId2)) return;
//         if (message.author.bot) return;

//         let args;
//         if      (message.content.startsWith(clientId1)) {args = message.content.slice(clientId1.length).trim().split(/ +/g);}
//         else if (message.content.startsWith(clientId2)) {args = message.content.slice(clientId2.length).trim().split(/ +/g);}

//         let commandName = args.shift().toLowerCase();
//         if (!commandName) {message.reply({ content: "What the f*** do you want???" }).catch(); return;}

//         const botCommand = client.botCommands.get(commandName)

//         if (!botCommand) {message.reply({ content: `**${commandName}** is not a command` }).catch(); return;}
//         if (botCommand) try {
//             botCommand.run({ client, message, args })
//             message.delete()
//         } catch {return}
//     } catch (e) {console.error('Error in messageCreate:', e); return}
// })

// client.on("voiceStateUpdate", async (oldMember, newMember) => {
//     if (oldMember.channel != null && oldMember.channel != newMember.channel && oldMember.channel.members.size == 0)
//         try {await client.botCommands.get('delete').run({ client })} catch {}
// });

client.on('guildMemberAdd', async member => {
    const guild = client.guilds.cache.get(member.guild.id);
    const main = guild.channels.cache.get(guild.systemChannelId);
    var wel_msg, roles_list;
    try {wel_msg = guilds_settings.get(member.guild.id).welcome_message} catch {wel_msg = true}
    try {roles_list = guilds_settings.get(member.guild.id).default_roles} catch {roles_list = []}
    if (wel_msg && main) {
        const embed = new DiscordJS.EmbedBuilder().setTitle("Welcome").setColor(DiscordJS.Colors.DarkGreen).setTimestamp()
        .setThumbnail(client.users.cache.get(member.id).avatarURL({ dynamic: true, format: 'png', size: 64 }))
        .setDescription(`Hey ${member}, welcome to **${member.guild}**!`)
        main.send({ embeds: [embed] });
    }
    // if (!member.user.bot) {
    //     if (roles_list[0]) {
    //         for (i in roles_list) {
    //             if (guild.roles.cache.map(role => role).filter(role => role.tags && role.tags.botId == client.user.id)[0].rawPosition > guild.roles.cache.get(roles_list[i]).rawPosition)
    //                 try {await member.roles.add(guild.roles.cache.get(roles_list[i]))} catch (e) {console.log('Error in GuildMemberAdd:', e)}
    //         }
    //     }
    // }
})

client.on('guildMemberRemove', async member => {
    const guild = client.guilds.cache.get(member.guild.id);
    const main = guild.channels.cache.get(guild.systemChannelId);
    if (!main) {return}
    var wel_msg;
    try {wel_msg = guilds_settings.get(member.guild.id).welcome_message} catch {wel_msg = true}
    if (wel_msg) {
        const embed = new DiscordJS.EmbedBuilder().setTitle("Goodbye").setColor(DiscordJS.Colors.Red).setTimestamp()
        .setThumbnail(client.users.cache.get(member.id).avatarURL({ dynamic: true, format: 'png', size: 64 }))
        .setDescription(`Goodbye \`${member.user.username}#${member.user.discriminator}\`, have a great time!`)
        main.send({embeds: [embed]});
    }
})

client.login(process.env.TOKEN)