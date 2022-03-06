const types = require("../../arg_type.json");
const fetch = require("node-fetch");
const discord = require("discord.js");

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
    subs = [];
    try {
        for (i in sub_list) subs.push(await fetch(`https://www.reddit.com/r/${sub_list[i]}/top/.json?sort=top&t=day`).then(res => res.json()));
        const img = get_img(subs);
        if (img.endsWith("mp4") || img.endsWith("gif")) return img
        const embed = new discord.MessageEmbed()
        .setColor("RANDOM")
        .setImage(img)
        .setTitle(`Here is a random ${arg}`)
        .setURL(`https://reddit.com/`);
        return {embeds: [embed]}
    } catch (e) {console.log('Error in /random fetch:', e); return "Try again"}
}

module.exports = {
    test: false,
    name: 'random',
    description: 'Send random shit',
    args: [
        {
            name: 'type',
            description: 'Type of shit to send',
            type: types.string,
            required: true,
            choices: [
                {
                    name: 'meme',
                    value: 'meme'
                },
                {
                    name: 'dog',
                    value: 'dog'
                },
                {
                    name: 'cat',
                    value: 'cat'
                },
                {
                    name: 'rat',
                    value: 'rat'
                }
            ],
        },
    ],
    callback: async ({ args }) => {
        try {
            const val = args[0].value;
            switch (val) {
                case 'meme': return await sub(["meme", "cursedcomments"], val);
                case 'dog': return await sub(["dog", "Cutedogsreddit", "Uglydogs"], val);
                case 'cat': return await sub(["cat"], val);
                case 'rat': return await sub(["rats"], val);
                default: return "Oups, I don't know about that"
            }
        } catch (e) {console.log('Error in /random:', e); return "Oups, I can't do that"}
    },
}