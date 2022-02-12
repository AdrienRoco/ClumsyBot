const { readdirSync } = require("fs");
const ascii = require('ascii-table');

let table = new ascii("Commands");
table.setHeading("Command", "Load status", "Type");

module.exports = (client) => {
    console.log("Bot cmds:\t1️⃣");
    console.log("Slash cmds:\t2️⃣");
    readdirSync("./handlers/").forEach(dir => {
        if (dir != "command.js") {
            const commands = readdirSync(`./handlers/${dir}/`).filter(file => file.endsWith(".js"));

            for (let file of commands) {
                let pull = require(`../handlers/${dir}/${file}`);
                if (dir == "cmd") {
                    if (pull.name) {
                        client.botcommands.set(pull.name, pull);
                        table.addRow(file, '✔️', '1️⃣');
                    } else {
                        table.addRow(file, '❌', '❌');
                        continue;
                    }
                } else if (dir == "slh") {
                    if (pull.name) {
                        pull.name = pull.name.replace(/\s+/g, '').toLowerCase()
                        client.slhcommands.set(pull.name, pull);
                        table.addRow(file, '✔️', '2️⃣');
                    } else {
                        table.addRow(file, '❌', '❌');
                        continue;
                    }
                }
            }
        }
    });
    console.log(table.toString());
}