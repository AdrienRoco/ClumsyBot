const temp_channels = require('../../channels.js');

module.exports = {
    name: "delete",
    run: async ({ client }) => {
        try {
            const list = Object.keys(temp_channels.get());
            for (i in list) {
                const ct = client.channels.cache.get(list[i])
                const tx = client.channels.cache.get(temp_channels.get()[list[i]].text)
                const vc = client.channels.cache.get(temp_channels.get()[list[i]].voice)
                if (vc && vc.members.size == 0) {
                    try {await vc.delete();} catch {}
                    try {await tx.delete();} catch {}
                    try {await ct.delete();} catch {}
                    temp_channels.remove(list[i]);
                } else if (!vc || !tx || !ct) {
                    try {await vc.delete();} catch {}
                    try {await tx.delete();} catch {}
                    try {await ct.delete();} catch {}
                    temp_channels.remove(list[i]);
                }
            }
            await temp_channels.save();
        } catch (e) {console.log('Error in delete channels: ', e); return}
    }
}