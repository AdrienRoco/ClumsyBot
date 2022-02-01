const colors = require("../../colors.json");
const types = require("../../arg_type.json");
const discord = require("discord.js");
const fetch = require("node-fetch");

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
        const embed = new discord.MessageEmbed()
        .setColor("RANDOM")
        .setImage(img)
        .setTitle(`Here is a random ${arg}`)
        .setURL(`https://reddit.com/`);
        if (img.endsWith("mp4") || img.endsWith("gif")) return img
        else return embed
    } catch {return "Try again"}
}

module.exports = {
    test: true,
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
            switch (args[0]) {
                case 'meme': return await sub(["meme", "cursedcomments"], args[0]);
                case 'dog': return await sub(["dog", "Cutedogsreddit", "Uglydogs"], args[0]);
                case 'cat': return await sub(["cat"], args[0]);
                case 'rat': return await sub(["rats"], args[0]);
                default: return "Oups, I don't know about that"
            }
        } catch {return "Oups, I can't do that"}
    },
}