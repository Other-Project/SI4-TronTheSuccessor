const postcss = require('postcss')
const fs = require('fs/promises')
const {plugins} = require("./postcss.config.js")
 
exports.processCSS = async function(filepath) {
    const css = await fs.readFile(filepath);
    const result = postcss(plugins).process(css, { from: filepath, to: filepath });
    return result;
}
