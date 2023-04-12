const fs = require('fs');
const file_path = './config/user.json';

var user_scores = {};

exports.get = function(userId = null) {
    if (userId && userId in user_scores) return user_scores[userId]
    else if (userId) return {'score': 0};
    return user_scores;
}

exports.add = function(userId, name, guild, score = 1) {
    if (!user_scores[userId]) {
        user_scores[userId] = {
            'name': name,
            'guilds': [guild],
            'score': score
        }
    } else {
        if (!user_scores[userId]['guilds'].includes(guild)) user_scores[userId]['guilds'].push(guild)
        user_scores[userId]['score'] += score;
    }
}

exports.remove = function(userId) {
    delete user_scores[userId];
}

exports.save = async function() {
    const data = JSON.stringify(user_scores, null, 2);
    fs.writeFileSync(file_path, data, (err) => {if (err) throw err})
}

exports.load = async function() {
    try {
        const rawdata = fs.readFileSync(file_path);
        const data = JSON.parse(rawdata);
        user_scores = data;
    } catch {fs.writeFileSync(file_path, '{}', (err) => {if (err) throw err})}
}
