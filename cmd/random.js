const fetch = require("node-fetch");
const DiscordJS = require("discord.js");

function get_img(subs) {
    const extention_list = [".jpg", ".jpeg", ".png", ".gif", ".mp4"];
    temp = [];
    urls = [];
    for (i in subs)
        for (y in subs[i].data.children)
            temp.push(subs[i].data.children[y].data.url);
    for (i in temp)
        for (y in extention_list)
            if (temp[i].endsWith(extention_list[y])) urls.push(temp[i]);
    return urls[Math.floor(Math.random() * urls.length)];
}

async function sub(sub_list, arg) {
    let subs = [];
    try {
        for (i in sub_list) subs.push(await fetch(`https://www.reddit.com/r/${sub_list[i]}/top/.json?sort=top&t=day`).then(res => res.json()));
        const img = get_img(subs);
        if (img.endsWith("mp4") || img.endsWith("gif")) return img;
        const embed = new DiscordJS.EmbedBuilder()
        .setColor(DiscordJS.Colors.Orange)
        .setImage(img)
        .setTitle(`Here is a random ${arg}`)
        .setURL(`https://reddit.com/`);
        return embed
    } catch (e) {console.error('Error in /random fetch:', e)}
}

module.exports = {
    test: true,
    data: new DiscordJS.SlashCommandBuilder()
        .setName('random')
        .setDescription('Send random shit')
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('type')
            .setDescription('Type of shit to send')
            .setRequired(true)
            .addChoices(
                {name: 'meme', value: 'meme'},
                {name: 'dog', value: 'dog'},
                {name: 'cat', value: 'cat'},
                {name: 'rat', value: 'rat'})
        ),
    async execute({interaction, options}) {
        try {
            const value = options[0].value;
            let response;
            await interaction.deferReply()
            switch (value) {
                case 'meme': {response = await sub(["meme", "cursedcomments"], value); break}
                case 'dog': {response = await sub(["dog", "Cutedogsreddit", "Uglydogs"], value); break}
                case 'cat': {response = await sub(["cat"], value); break}
                case 'rat': {response = await sub(["rats"], value); break}
                default: response = "Oups, I f*cked up!"
            }
            await interaction.editReply(typeof response == 'string' ? response : {embeds: [response]});
        } catch (e) {console.error('Error in /random:', e)}
    },
}