const colors = require("../../colors.json");
const types = require("../../arg_type.json");
const discord = require("discord.js");
const random_search = require("random-puppy");

async function meme() {
    try {
        const subReddits = ["funny", "meme", "memes", "cursedcomments", "AbruptChaos", "instant_regret", "instantkarma"];
        const random = subReddits[Math.floor(Math.random() * subReddits.length)];
        const reddit = await fetch(`https://www.reddit.com/r/${random}/top/.json?sort=top&t=day`).then(res => res.json())
        const img = reddit.data.children[Math.floor(Math.random() * reddit.data.children.length)].data.url;
        const embed = new discord.MessageEmbed()
        .setColor("RANDOM")
        .setImage(img)
        .setTitle(`From reddit.com/r/${random}`)
        .setURL(`https://reddit.com/r/${random}`);
        if (img.endsWith("mp4") || img.endsWith("gif")) return img
        return embed
    } catch {return "Try again"}
}

async function dog() {
    try {
        const subReddits = ["dog"];
        const random = subReddits[Math.floor(Math.random() * subReddits.length)];
        const img = await random_search(random);
        return img
    } catch {return "Try again"}
}

async function cat() {
    try {
        const subReddits = ["cat"];
        const random = subReddits[Math.floor(Math.random() * subReddits.length)];
        const img = await random_search(random);
        return img
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
            ],
        },
    ],
    callback: async ({ args }) => {
        try {
            switch (args[0]) {
                case 'meme': return await meme()
                case 'dog': return await dog()
                case 'cat': return await cat()
                default: return "Oups, I don't know about that"
            }
        } catch {return "Oups, I can't do that"}
    },
}