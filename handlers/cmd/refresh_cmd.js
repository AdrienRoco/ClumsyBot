function get_app(client, guildId = null) {
    const app = client.api.applications(client.user.id)
    if (guildId) app.guilds(guildId)
    return app
}

module.exports = {
    name: "refresh",
    run: async ({ client, message }) => {
        if (message.member.id != '168474820793729024') {return message.reply("You can't delete cdm's....").then(m => setTimeout(() => m.delete(), 3000))}
        const guild_test_ids = ['702461452564430948'];
        let commands
        for (i in guild_test_ids) {
            commands = await get_app(client, guild_test_ids[i]).commands.get().catch()
            for (y in commands) await get_app(client, guild_test_ids[i]).commands(commands[y].id).delete().catch().then(() => {console.log(`Cleaned up ${commands[y].name}`)})
        }
        commands = await get_app(client).commands.get().catch()
        for (i in commands) await get_app(client).commands(commands[i].id).delete().catch().then(() => {console.log(`Cleaned up ${commands[i].name}`)})
        console.log('Cleaning done');
        process.exit(0);
    }
}