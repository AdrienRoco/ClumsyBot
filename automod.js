/**
 * AutoMod Module - Webhook-based Message Verification
 *
 * Webhook URL: https://n8n.stayclumsy.com/webhook-test/discord-moderation
 * Response format: { status: "ok|warning|danger", mean_lvl: "none|low|medium|high|severe", response: "explanation" }
 */

const DiscordJS = require('discord.js');
const { MessageFlags } = require('discord.js');
const guilds_settings = require('./configuration.js');
const user_scores = require('./userscores.js');
const { sendWebhook } = require('./webhook.js');

// DEBUG setting to control which embeds to send based on status level
// Options: 'ok' (send all), 'warning' (send warning and danger), 'danger' (send only danger)
const DEBUG = 'warning'; // Change this to 'ok', 'warning', or 'danger' as needed
const WEBHOOK_URL = 'https://n8n.stayclumsy.com/webhook/discord-moderation';

function embed_builder(message, webhookResponse) {
  const { status, mean_lvl, response } = webhookResponse;

  // Set color based on status
  const color = status === 'danger' ? DiscordJS.Colors.Red : status === 'warning' ? DiscordJS.Colors.Orange : DiscordJS.Colors.Yellow;

  const embed = new DiscordJS.EmbedBuilder()
    .setColor(color)
    .setTimestamp()
    .setTitle('AutoMod')
    .setThumbnail(message.author.avatarURL({ extension: 'png', size: 64 }))
    .setDescription('AutoMod found suspicious content\nYou might want to check it out!')
    .addFields([
      { name: '`Channel:`', value: `${message.channel}\n**${message.guild} - ${message.channel.name}**`, inline: false },
      { name: '`Author:`', value: `${message.author}\n**${message.author.username}**`, inline: false },
      { name: '`Score:`', value: `${user_scores.get(message.author.id)['score']}`, inline: false },
      { name: '`Message:`', value: `${message.content}`, inline: false },
      { name: '`Status:`', value: `${status.toUpperCase()}`, inline: true },
      { name: '`Severity Level:`', value: `${mean_lvl.toUpperCase()}`, inline: true },
      { name: '`Analysis:`', value: `${response}`, inline: false },
      { name: '`Action:`', value: 'Under review', inline: false },
    ])
    .setFooter({ text: 'Flagged by Webhook' });
  return embed;
}

function dm_builder(type, analysis, interaction) {
  const embed = new DiscordJS.EmbedBuilder()
    .setColor(type == 2 ? DiscordJS.Colors.Yellow : type == 3 ? DiscordJS.Colors.Orange : type == 4 ? DiscordJS.Colors.Red : DiscordJS.Colors.White)
    .setTimestamp()
    .setTitle('AutoMod')
    .setThumbnail(interaction.user.avatarURL({ extension: 'png', size: 64 }))
    .setDescription('AutoMod found suspicious content\n' + `${type == 2 ? 'After review, your message has been deleted!' : type == 3 ? 'After review, you have been kicked from the server!' : type == 4 ? 'After review, you have been banned from the server!' : 'No further actions have been taken.'}`)
    .addFields([
      { name: '`Channel:`', value: `${interaction.message.embeds[0].fields[0].value}`, inline: false },
      { name: '`Author:`', value: `${interaction.message.embeds[0].fields[1].value}`, inline: false },
      { name: '`Message:`', value: `${interaction.message.embeds[0].fields[3].value}`, inline: false },
      { name: '`Analysis:`', value: `${analysis}`, inline: false },
    ])
    .setFooter({ text: 'Flagged by Webhook' });
  return embed;
}

exports.interaction = async function (client, interaction) {
  try {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    if (!interaction.member.permissions.has(DiscordJS.PermissionFlagsBits.ManageMessages)) {
      return await interaction.editReply({ content: 'You do not have permission to do that!' });
    }
    const options = interaction.customId.split('_');
    const user = client.guilds.cache.get(interaction.guildId).members.cache.get(options[3]);
    const severityLevel = options[4]; // This will now be the severity level instead of score
    const message = await client.guilds.cache
      .get(interaction.guildId)
      .channels.cache.get(interaction.message.embeds[0].fields[0].value.match(/<#(\d+)>/)?.[1])
      .messages.fetch(options[2]);

    // Calculate score based on severity level
    const scoreMap = { none: 0, low: 1, medium: 2, high: 3, severe: 4 };
    const score = scoreMap[severityLevel] || 1;

    var embed = DiscordJS.EmbedBuilder.from(interaction.message.embeds[0])
      .setColor(DiscordJS.Colors.White)
      .setFooter({ text: `Action taken by ${interaction.user.username}` })
      .setFields([
        interaction.message.embeds[0].fields[0], // Channel
        interaction.message.embeds[0].fields[1], // Author
        interaction.message.embeds[0].fields[2], // Score
        interaction.message.embeds[0].fields[3], // Message
        interaction.message.embeds[0].fields[4], // Status
        interaction.message.embeds[0].fields[5], // Severity Level
        interaction.message.embeds[0].fields[6], // Analysis
      ]);

    const analysis = interaction.message.embeds[0].fields[6].value; // Get analysis from embed

    switch (options[1]) {
      case '1':
        embed.addFields({ name: '`Action:`', value: 'None', inline: false });
        break;
      case '2':
        try {
          await message.delete();
        } catch {}
        await user_scores.add(user.id, `${user.user.username}`, interaction.member.guild.name, score);
        embed.addFields({ name: '`Action:`', value: 'Deleted', inline: false });
        embed.data.fields[2].value = `${parseInt(embed.data.fields[2].value) + score}`;
        try {
          await user.send({ embeds: [dm_builder(2, analysis, interaction)] });
        } catch {}
        break;
      case '3':
        if (!interaction.member.permissions.has(DiscordJS.PermissionFlagsBits.KickMembers)) {
          return await interaction.editReply({ content: 'You do not have permission to do that!' });
        }
        try {
          await message.delete();
        } catch {}
        await user_scores.add(user.id, `${user.user.username}`, interaction.member.guild.name, score + 1);
        embed.addFields({ name: '`Action:`', value: 'Kicked', inline: false });
        embed.data.fields[2].value = `${parseInt(embed.data.fields[2].value) + score + 1}`;
        try {
          await user.send({ embeds: [dm_builder(3, analysis, interaction)] });
        } catch {}
        try {
          await user.kick(interaction.message.embeds[0].fields[3].value);
        } catch {}
        break;
      case '4':
        if (!interaction.member.permissions.has(DiscordJS.PermissionFlagsBits.BanMembers)) {
          return await interaction.editReply({ content: 'You do not have permission to do that!' });
        }
        try {
          await message.delete();
        } catch {}
        await user_scores.add(user.id, `${user.user.username}`, interaction.member.guild.name, score + 2);
        embed.addFields({ name: '`Action:`', value: 'Banned', inline: false });
        embed.data.fields[2].value = `${parseInt(embed.data.fields[2].value) + score + 2}`;
        try {
          await user.send({ embeds: [dm_builder(4, analysis, interaction)] });
        } catch {}
        try {
          await user.ban(interaction.message.embeds[0].fields[3].value);
        } catch {}
        break;
      default:
        break;
    }
    await user_scores.save();
    await interaction.message.edit({ embeds: [embed], components: [] });
    await interaction.deleteReply();
  } catch (e) {
    console.error(e);
  }
};

exports.audit = async function (client, message, webhookResponse) {
  const channel = client.channels.cache.get(guilds_settings.get(message.guild.id).auto_mod_channel);
  if (!channel) {
    return;
  }

  // Check if we should send this embed based on DEBUG level
  const shouldSendEmbed = (status, debugLevel) => {
    if (debugLevel === 'ok') return true; // Send all embeds
    if (debugLevel === 'warning') return status === 'warning' || status === 'danger'; // Send warning and danger
    if (debugLevel === 'danger') return status === 'danger'; // Send only danger
    return false;
  };

  if (!shouldSendEmbed(webhookResponse.status, DEBUG)) {
    return; // Don't send embed based on DEBUG level
  }

  const embed = embed_builder(message, webhookResponse);
  const actions = new DiscordJS.ActionRowBuilder().addComponents(new DiscordJS.ButtonBuilder().setLabel('Ok').setCustomId(`automod_1_${message.id}_${message.author.id}`).setDisabled(false).setStyle(DiscordJS.ButtonStyle.Success), new DiscordJS.ButtonBuilder().setLabel('Delete').setCustomId(`automod_2_${message.id}_${message.author.id}_${webhookResponse.mean_lvl}`).setDisabled(false).setStyle(DiscordJS.ButtonStyle.Secondary), new DiscordJS.ButtonBuilder().setLabel('Kick').setCustomId(`automod_3_${message.id}_${message.author.id}_${webhookResponse.mean_lvl}`).setDisabled(false).setStyle(DiscordJS.ButtonStyle.Primary), new DiscordJS.ButtonBuilder().setLabel('Ban').setCustomId(`automod_4_${message.id}_${message.author.id}_${webhookResponse.mean_lvl}`).setDisabled(false).setStyle(DiscordJS.ButtonStyle.Danger));
  try {
    await channel.send({ embeds: [embed], components: [actions] });
  } catch {}
};

exports.check = async function (client, message) {
  const guild = message.guild;
  const guildId = guild.id;
  const guild_settings = guilds_settings.get(guildId);
  if (!guild_settings) return null;
  if (!guilds_settings.get(guildId).auto_mod) return null;

  const channel = client.channels.cache.get(guilds_settings.get(guildId).auto_mod_channel);
  if (!channel) return null;

  try {
    // Prepare webhook data
    const webhookData = {
      message: message.content,
      author: {
        id: message.author.id,
        username: message.author.username,
      },
      guild: {
        id: guild.id,
        name: guild.name,
      },
      channel: {
        id: message.channel.id,
        name: message.channel.name,
      },
      timestamp: message.createdAt.toISOString(),
    };

    // Send webhook request
    const webhookResult = await sendWebhook(WEBHOOK_URL, webhookData, {
      timeout: 10000, // 10 second timeout
      method: 'POST',
    });

    // Check if webhook request was successful
    if (!webhookResult.success) {
      const errorDetails = webhookResult.error || `${webhookResult.status} ${webhookResult.statusText}`;
      console.error(`[AutoMod] Webhook request failed:`, errorDetails);
      return null;
    }

    // Parse webhook response
    const responseData = webhookResult.data;

    // Validate response format
    if (!responseData || !responseData.status || !responseData.mean_lvl || !responseData.response) {
      console.error(`[AutoMod] Invalid webhook response format:`, responseData);
      return null;
    }

    // Check if message should be flagged
    if (responseData.status === 'ok' && DEBUG !== 'ok') {
      return null; // Don't process if DEBUG level doesn't include 'ok' messages
    }

    // Return webhook response for further processing
    return {
      status: responseData.status,
      mean_lvl: responseData.mean_lvl,
      response: responseData.response,
    };
  } catch (error) {
    console.error(`[AutoMod] Error during webhook check:`, error);
    return null;
  }
};

exports.load = async function () {
  await user_scores.load();
};
