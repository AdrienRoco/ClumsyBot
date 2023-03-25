const fs = require('fs');
const file_path = './config/guilds_settings.json';

var guilds_settings = {};

exports.get = function(id = null) {
    try {if (id) return guilds_settings[id]} catch {return undefined}
    return guilds_settings;
}

exports.set = function(guildId,
    welcome_message = true,
    default_roles = [],
    temp_chan_cat = null)
{
    guilds_settings[guildId] = {
        "welcome_message": welcome_message,
        "default_roles": default_roles,
        "temp_chan_cat": temp_chan_cat
    }
}

exports.modify = function(guildId, key, data) {
    guilds_settings[guildId][key] = data;
}

exports.remove = function(guildId) {
    delete guilds_settings[guildId];
}

exports.save = async function() {
    const data = JSON.stringify(guilds_settings, null, 2);
    fs.writeFileSync(file_path, data, (err) => {if (err) throw err});
}

exports.load = async function() {
    try {
        const rawdata = fs.readFileSync(file_path);
        const data = JSON.parse(rawdata);
        guilds_settings = data;
    } catch {fs.writeFileSync(file_path, "{}", (err) => {if (err) throw err})}
}