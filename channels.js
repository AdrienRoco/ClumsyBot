const fs = require('fs');
const file_path = './config/temp_ids.json';

var temp_channels = {};

exports.get = function(id = null) {
    try {if (id) return temp_channels[id]} catch {return undefined}
    return temp_channels;
}

exports.set = function(data) {
    temp_channels = data;
}

exports.add = function(voiceId, private = false) {
    temp_channels[voiceId] = {
        "private": private
    }
}

exports.remove = function(voiceId) {
    delete temp_channels[voiceId];
}

exports.save = async function() {
    const data = JSON.stringify(temp_channels, null, 2);
    fs.writeFileSync(file_path, data, (err) => {if (err) throw err});
}

exports.load = async function() {
    try {
        const rawdata = fs.readFileSync(file_path);
        const data = JSON.parse(rawdata);
        temp_channels = data;
    } catch {fs.writeFileSync(file_path, "{}", (err) => {if (err) throw err})}
}