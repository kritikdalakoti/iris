const path = require('path');
const fs = require('fs');
const _ = require('lodash');

export async function init(server) {

    console.log("I am in routes index");

    let files = await fs.readdirSync(__dirname);

    await files.forEach(async file => {

        if (file === 'index.js') {
            return;
        }

        if (path.extname(file) === '.js') {

            const module = await import(path.join(__dirname, file))
            await module.default(server);
        }
    })
}
