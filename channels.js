const fs = require('fs');

var temp_channels = {};

exports.get = function() {
    return temp_channels;
}

exports.set = function(data) {
    temp_channels = data;
}

exports.add = function(categoryId, textId, voiceId, private = false) {
    temp_channels[categoryId] = {
        "text": textId,
        "voice": voiceId,
        "private": private
    }
}

exports.remove = function(categoryId) {
    delete temp_channels[categoryId];
}

exports.save = async function() {
    const data = JSON.stringify(temp_channels, null, 2);
    fs.writeFileSync('./config/temp_ids.json', data, (err) => {if (err) throw err});
}

exports.load = async function() {
    const rawdata = fs.readFileSync('./config/temp_ids.json');
    const data = JSON.parse(rawdata);
    temp_channels = data;
}
