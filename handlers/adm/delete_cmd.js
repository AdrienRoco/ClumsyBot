function get_app(client, guildId) {
    const app = client.api.applications(client.user.id)
    if (guildId) {
        app.guilds(guildId)
    }
    return app
}

module.exports = {
    name: "delete",
    aliases: [],
    category: "admin",
    description: "clean messages",
    run: async (client, message, args) => {
        const guildIds = ['702461452564430948']
        if (!message.member.hasPermission("ADMINISTRATOR")) {
            return message.reply("You can't delete cdm's....").then(m => m.delete({timeout:3000}).catch());
        }
        console.log('Cleaning up...');
        for (i in guildIds) {
            const commands = await get_app(client, guildIds[i]).commands.get().catch(() => {console.log("no commands")})
            for (y in commands) {
                await get_app(client, guildIds[i]).commands(commands[y].id).delete().catch(() => {console.log("no command")})
            }
        }
        commands = null
        commands = await get_app(client, null).commands.get().catch(() => {console.log("no command")})
        for (y in commands) {
            await get_app(client, null).commands(commands[y].id).delete().catch(() => {console.log("no command")})
        }
        console.log('Cleaning done');
        process.exit(42)
    }
}