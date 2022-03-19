const fs = require('fs');
const file_path = './config/guilds_settings.json';

var guilds_settings = {};

exports.get = function(id = null) {
    if (id) return guilds_settings[id];
    return guilds_settings;
}

exports.set = function(guildId, welcome_message = true, welcome_dm = true, default_roles = [], game_roles = [], channels_possition = 1) {
    guilds_settings[guildId] = {
        "welcome_message": welcome_message,
        "welcome_dm": welcome_dm,
        "default_roles": default_roles,
        "game_roles": game_roles,
        "temp_chan_pos": channels_possition
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
    const rawdata = fs.readFileSync(file_path);
    const data = JSON.parse(rawdata);
    guilds_settings = data;
}
