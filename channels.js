const fs = require('fs');
const file_path = './config/temp_ids.json';

var temp_channels = {};

exports.get = function(id = null) {
    if (id && id in temp_channels) return temp_channels[id]
    else if (id) return null;
    return temp_channels;
}

exports.add = function(voiceId, private = false, hidden = false) {
    temp_channels[voiceId] = {
        'private': private,
        'hidden': hidden
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
    } catch {fs.writeFileSync(file_path, '{}', (err) => {if (err) throw err})}
}