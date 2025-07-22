require('dotenv').config({ path: './config/.env' });
const guilds_settings = require('./configuration.js');
const temp_channels = require('./channels.js');
const auto_mod = require('./automod.js');
const DiscordJS = require('discord.js');
const fs = require('fs');
const wait = require('node:timers/promises').setTimeout;
const guild_test_ids = process.env.TEST_IDS.split(',');
const client = new DiscordJS.Client({ intents: 3276799 });
const rest = new DiscordJS.REST({ version: '10' }).setToken(process.env.TOKEN);

client.Commands = new DiscordJS.Collection();
client.CacheInteractions = new DiscordJS.Collection();

client.on(DiscordJS.Events.ClientReady, async () => {
  await guilds_settings.load();
  await temp_channels.load();
  await auto_mod.load();

  const commands_test = [];
  const commands_main = [];
  const commandFiles = fs.readdirSync('./cmd').filter((file) => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./cmd/${file}`);
    if (command.test) commands_test.push(command.data.toJSON());
    else commands_main.push(command.data.toJSON());
    if ('data' in command && 'execute' in command) client.Commands.set(command.data.name, command);
    else console.warn(`[WARNING] The command at ${filePath} is missing a required 'data' or 'execute' property.`);
  }
  await (async () => {
    try {
      console.log(`Started refreshing ${commands_test.length} guilds (/) commands.`);
      guild_test_ids.forEach(async (element) => {
        await rest.put(DiscordJS.Routes.applicationGuildCommands(client.user.id, element), { body: commands_test });
      });
      console.log(`Started refreshing ${commands_main.length} application (/) commands.`);
      await rest.put(DiscordJS.Routes.applicationCommands(client.user.id), { body: commands_main });
      console.log(`Successfully reloaded all (/) commands.`);
    } catch (e) {
      console.error('Error in cmds loading:', e);
    }
  })();
  client.user.setActivity('you👀', { type: DiscordJS.ActivityType.Watching });
  console.info(`\n${client.user.username} Ready\n`);
});

client.on(DiscordJS.Events.InteractionCreate, async (interaction) => {
  try {
    // Slash command management
    if (interaction.isCommand()) {
      const command = client.Commands.get(interaction.commandName);
      const options = interaction.options._hoistedOptions;
      await command.execute({ client, interaction, options });
    }
    // Selection menu and button management
    else if (interaction.isStringSelectMenu() || interaction.isButton()) {
      if (interaction.message.interaction) await client.Commands.get(interaction.message.interaction.commandName).execute({ client, interaction });
      else {
        switch (interaction.customId.split('_')[0]) {
          case 'automod': {
            auto_mod.interaction(client, interaction);
            break;
          }
          case 'gameroles': {
            client.Commands.get('game_roles').execute({ client, interaction });
            break;
          }
          default:
            break;
        }
      }
    }
  } catch (e) {
    console.error('Error in interactionCreate:', e);
  }
});

client.on(DiscordJS.Events.MessageCreate, async (message) => {
  try {
    if (message.author.bot) return;
    if (!message.guildId) return;

    const automod = await auto_mod.check(client, message);
    if (automod) await auto_mod.audit(client, message, automod);

    if (
      message.content
        .toLowerCase()
        .replace(/[^\w]/gi, '')
        .replace(/(.)\1+/g, '$1')
        .endsWith('quoi')
    ) {
      message.reply({ content: 'feur' });
      return;
    }
    if (
      message.content
        .toLowerCase()
        .replace(/[^\w]/gi, '')
        .replace(/(.)\1+/g, '$1')
        .endsWith('hein')
    ) {
      message.reply({ content: 'deux' });
      return;
    }

    const clientId1 = `<@${client.user.id}>`;
    const clientId2 = `<@!${client.user.id}>`;
    if (!message.content.startsWith(clientId1) && !message.content.startsWith(clientId2)) return;
    let args;
    if (message.content.startsWith(clientId1)) {
      args = message.content.slice(clientId1.length).trim().split(/ +/g);
    } else if (message.content.startsWith(clientId2)) {
      args = message.content.slice(clientId2.length).trim().split(/ +/g);
    }
    let commandName = args.shift().toLowerCase();
    if (!commandName) {
      message.reply({ content: 'What the f*** do you want???' }).catch();
      return;
    } else message.reply({ content: 'Use / to see every commands' }).catch();
    return;
  } catch (e) {
    console.error('Error in messageCreate:', e);
  }
});

client.on(DiscordJS.Events.VoiceStateUpdate, async (oldState, newState) => {
  try {
    if (oldState.channel == newState.channel) return;
    if (oldState.member.user.bot) return;
    // User Disconnect
    if (newState.channel == null && oldState.channel != null && guilds_settings.get(oldState.guild.id)) {
      if (Object.keys(temp_channels.get()).includes(oldState.channel.id) && oldState.channel.members.size == 0) {
        await wait(5000);
        await client.Commands.get('delete').execute({ client });
      }
      return;
    }
    // User Connect
    if (newState.channel != null && oldState.channel == null && guilds_settings.get(newState.guild.id)) {
      if (guilds_settings.get(newState.guild.id).temp_chan_create != null && newState.channel.id == guilds_settings.get(newState.guild.id).temp_chan_create) {
        const options = [{ value: 'normal', guild: newState.guild, user: newState.member.user }];
        await client.Commands.get('create').execute({ options });
        return;
      }
      if (guilds_settings.get(newState.guild.id).temp_priv_create != null && newState.channel.id == guilds_settings.get(newState.guild.id).temp_priv_create) {
        const options = [{ value: 'priv', guild: newState.guild, user: newState.member.user }];
        await client.Commands.get('create').execute({ options });
        return;
      }
      if (guilds_settings.get(newState.guild.id).temp_hide_create != null && newState.channel.id == guilds_settings.get(newState.guild.id).temp_hide_create) {
        const options = [{ value: 'hide', guild: newState.guild, user: newState.member.user }];
        await client.Commands.get('create').execute({ options });
        return;
      }
      return;
    }
    // User Move
    if (newState.channel != null && oldState.channel != null) {
      if (guilds_settings.get(newState.guild.id).temp_chan_create != null && newState.channel.id == guilds_settings.get(newState.guild.id).temp_chan_create) {
        const options = [{ value: 'normal', guild: newState.guild, user: newState.member.user }];
        await client.Commands.get('create').execute({ options });
      }
      if (guilds_settings.get(newState.guild.id).temp_priv_create != null && newState.channel.id == guilds_settings.get(newState.guild.id).temp_priv_create) {
        const options = [{ value: 'priv', guild: newState.guild, user: newState.member.user }];
        await client.Commands.get('create').execute({ options });
      }
      if (guilds_settings.get(newState.guild.id).temp_hide_create != null && newState.channel.id == guilds_settings.get(newState.guild.id).temp_hide_create) {
        const options = [{ value: 'hide', guild: newState.guild, user: newState.member.user }];
        await client.Commands.get('create').execute({ options });
      }
      if (Object.keys(temp_channels.get()).includes(oldState.channel.id) && oldState.channel.members.size == 0) {
        await wait(5000);
        await client.Commands.get('delete').execute({ client });
      }
      return;
    }
  } catch (e) {
    console.error('Error in voiceStateUpdate:', e);
  }
});

client.on(DiscordJS.Events.GuildMemberAdd, async (member) => {
  const guild = client.guilds.cache.get(member.guild.id);
  const main = guild.channels.cache.get(guild.systemChannelId);
  var wel_msg, roles_list;
  try {
    wel_msg = guilds_settings.get(member.guild.id).welcome_message;
  } catch {
    wel_msg = true;
  }
  try {
    roles_list = guilds_settings.get(member.guild.id).default_roles;
  } catch {
    roles_list = [];
  }
  if (wel_msg && main) {
    const embed = new DiscordJS.EmbedBuilder()
      .setTitle('Welcome')
      .setColor(DiscordJS.Colors.DarkGreen)
      .setTimestamp()
      .setThumbnail(client.users.cache.get(member.id).avatarURL({ dynamic: true, format: 'png', size: 64 }))
      .setDescription(`Hey ${member}, welcome to **${member.guild}**!`);
    main.send({ embeds: [embed] });
  }
  if (!member.user.bot && roles_list[0]) {
    for (i in roles_list) {
      if (guild.roles.cache.map((role) => role).filter((role) => role.tags && role.tags.botId == client.user.id)[0].rawPosition > guild.roles.cache.get(roles_list[i]).rawPosition)
        try {
          await member.roles.add(guild.roles.cache.get(roles_list[i]));
        } catch (e) {
          console.error('Error in GuildMemberAdd:', e);
        }
    }
  }
});

client.on(DiscordJS.Events.GuildMemberRemove, async (member) => {
  const guild = client.guilds.cache.get(member.guild.id);
  const main = guild.channels.cache.get(guild.systemChannelId);
  if (!main) {
    return;
  }
  var wel_msg;
  try {
    wel_msg = guilds_settings.get(member.guild.id).welcome_message;
  } catch {
    wel_msg = true;
  }
  if (wel_msg) {
    const embed = new DiscordJS.EmbedBuilder()
      .setTitle('Goodbye')
      .setColor(DiscordJS.Colors.Red)
      .setTimestamp()
      .setThumbnail(client.users.cache.get(member.id).avatarURL({ dynamic: true, format: 'png', size: 64 }))
      .setDescription(`Goodbye \`${member.user.username}#${member.user.discriminator}\`, have a great time!`);
    main.send({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
