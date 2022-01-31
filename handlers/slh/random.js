const colors = require("../../colors.json");
const types = require("../../arg_type.json");
const discord = require("discord.js");
const fetch = require("node-fetch");

async function sub(sub_list) {
    var random;
    const extention_list = [".jpg", ".jpeg", ".png", ".gif", ".mp4"];
    try {
        if (sub_list.length != 1) random = sub_list[Math.floor(Math.random() * sub_list.length)];
        else random = sub_list[0];
        const reddit = await fetch(`https://www.reddit.com/r/${random}/top/.json?sort=top&t=day`).then(res => res.json());
        const img = reddit.data.children[Math.floor(Math.random() * reddit.data.children.length)].data.url;
        for (var i = 0; i < extention_list.length; i++) {
            if (img.endsWith(extention_list[i])) break;
            if (i == extention_list.length - 1) sub(sub_list);
        }
        const embed = new discord.MessageEmbed()
        .setColor("RANDOM")
        .setImage(img)
        .setTitle(`From reddit.com/r/${random}`)
        .setURL(`https://reddit.com/r/${random}`);
        if (img.endsWith("mp4") || img.endsWith("gif")) return img
        return embed
    } catch {return "Try again"}
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
            switch (args[0]) {
                case 'meme': return await sub(["meme", "cursedcomments"])
                case 'dog': return await sub(["dog", "Cutedogsreddit", "Uglydogs"])
                case 'cat': return await sub(["cat"])
                case 'rat': return await sub(["rats"])
                default: return "Oups, I don't know about that"
            }
        } catch {return "Oups, I can't do that"}
    },
}