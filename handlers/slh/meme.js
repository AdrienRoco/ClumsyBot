const colors = require("../../colors.json");
const types = require("../../arg_type.json");
const { MessageEmbed } = require("discord.js");
const randomPuppy = require("random-puppy");

module.exports = {
    test: false,
    name: 'meme',
    description: 'Send a random meme',
    args: [],
    callback: async ({}) => {
        try {
            const subReddits = ["dankmeme", "meme", "dank_meme", "memes", "cursedcomments", "AbruptChaos", "instant_regret", "instantkarma"];
            const random = subReddits[Math.floor(Math.random() * subReddits.length)];
            const img = await randomPuppy(random);
            const embed = new MessageEmbed()
            .setColor("RANDOM")
            .setImage(img)
            .setTitle(`From reddit.com/r/${random}`)
            .setURL(`https://reddit.com/r/${random}`);
            if (img.endsWith("mp4") || img.endsWith("gif")) return img
            return embed
        } catch {
            return "Try again"
        }
    }
}