const { MessageEmbed } = require("discord.js");
const colors = require("../../colors.json");
const fs = require("fs");

var temp_cat = [];
var temp_ch = [];
var temp_tx = [];
var temp_cat_priv = [];
var temp_ch_priv = [];
var temp_tx_priv = [];

async function read_priv_file() {
    const rawdata = fs.readFileSync('./config/temp_priv_ids.json');
    const ids = JSON.parse(rawdata);
    for (let i = 0; i < ids.temp_cat_priv.length; i++) {
        temp_cat_priv.push(ids.temp_cat_priv[i]);
        temp_ch_priv.push(ids.temp_ch_priv[i]);
        temp_tx_priv.push(ids.temp_tx_priv[i]);
    }
}
async function write_priv_file() {
    const data = JSON.stringify({temp_cat_priv, temp_ch_priv, temp_tx_priv}, null, 2)
    fs.writeFileSync('./config/temp_priv_ids.json', data, (err) => {if (err) throw err;});
}

async function read_file() {
    const rawdata = fs.readFileSync('./config/temp_ids.json');
    const ids = JSON.parse(rawdata);
    for (let i = 0; i < ids.temp_cat.length; i++) {
        temp_cat.push(ids.temp_cat[i]);
        temp_ch.push(ids.temp_ch[i]);
        temp_tx.push(ids.temp_tx[i]);
    }
}
async function write_file() {
    const data = JSON.stringify({temp_cat, temp_ch, temp_tx}, null, 2)
    fs.writeFileSync('./config/temp_ids.json', data, (err) => {if (err) throw err;});
}

function wait(ms) {
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
        end = new Date().getTime();
    }
}

module.exports = {
    name: "delete_channels",
    run: async (client, message, args) => {
        try {
            temp_cat = [];
            temp_ch = [];
            temp_tx = [];
            temp_cat_priv = [];
            temp_ch_priv = [];
            temp_tx_priv = [];
            await read_file()
            await read_priv_file()
            const guild = client.guilds.cache.get(args[0])
            if (temp_cat.length != temp_ch.length && temp_cat.length != temp_tx.length) {console.log("Err in temp conf file"); return;}
            if (temp_cat_priv.length != temp_ch_priv.length && temp_cat_priv.length != temp_tx_priv.length) {console.log("Err in priv conf file"); return;}
            for (let i = temp_cat.length - 1; i >= 0; i--) {
                const c_ch = await guild.channels.cache.get(temp_cat[i].id);
                const t_ch = await guild.channels.cache.get(temp_tx[i].id);
                const v_ch = await guild.channels.cache.get(temp_ch[i].id);
                if (v_ch && v_ch.members.size <= 0) {wait(1500)}
                if (v_ch && v_ch.members.size <= 0) {
                    await v_ch.delete().catch()
                    await t_ch.delete().catch()
                    await c_ch.delete().catch()
                    temp_ch.splice(i, 1)
                    temp_tx.splice(i, 1)
                    temp_cat.splice(i, 1)
                }
                await write_file()
                wait(100)
            }
            for (let i = temp_cat_priv.length - 1; i >= 0; i--) {
                const c_ch_p = await guild.channels.cache.get(temp_cat_priv[i].id);
                const t_ch_p = await guild.channels.cache.get(temp_tx_priv[i].id);
                const v_ch_p = await guild.channels.cache.get(temp_ch_priv[i].id);
                if (v_ch_p && v_ch_p.members.size <= 0) {wait(1500)}
                if (v_ch_p && v_ch_p.members.size <= 0) {
                    await v_ch_p.delete().catch()
                    await t_ch_p.delete().catch()
                    await c_ch_p.delete().catch()
                    temp_ch_priv.splice(i, 1)
                    temp_tx_priv.splice(i, 1)
                    temp_cat_priv.splice(i, 1)
                }
                await write_priv_file()
                wait(100)
            }
        } catch {return}
    }
}