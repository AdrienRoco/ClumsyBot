require('dotenv').config({ path: './config/.env' });
const DiscordJS = require('discord.js');

const rest = new DiscordJS.REST({ version: '10' }).setToken(process.env.TOKEN);
const client = new DiscordJS.Client({ intents: 3276799 });
const guild_test_ids = process.env.TEST_IDS.split(',');

client.on('ready', async () => {
    console.info(`${client.user.username} here! Starting cleaning`)
// for guild-based commands
    guild_test_ids.forEach(async element => {
        await rest.put(DiscordJS.Routes.applicationGuildCommands(client.user.id, element), { body: [] })
            .then(() => console.log(`Successfully deleted all ${element} commands`))
            .catch(console.error);
    });

// for global commands
    await rest.put(DiscordJS.Routes.applicationCommands(client.user.id), { body: [] })
        .then(() => console.log('Successfully deleted application commands'))
        .catch(console.error);

    console.log('Cleaning done');
    process.exit(0);
})


client.login(process.env.TOKEN)