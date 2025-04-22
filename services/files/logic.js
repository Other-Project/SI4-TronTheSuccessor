// fs stands for FileSystem, it's the module to use to manipulate files on the disk.
const fs = require('fs/promises');
// path is used only for its parse method, which creates an object containing useful information about the path.
const path = require('path');

const postcss = require("./postcss.js");

// We will limit the search of files in the front folder (../../front from here).
// Note that fs methods consider the current folder to be the one where the app is run, that's why we don't need the "../.." before front.
const baseFrontPath = '/dist';
// If the user requests a directory, a file can be returned by default.
const defaultFileIfFolder = "index.html";

/* Dict associating files' extension to a MIME type browsers understand. The reason why this is needed is that only
** the file's content is sent to the browser, so it cannot know for sure what kind of file it was to begin with,
** and so how to interpret it. To help, we will send the type of file in addition to its content.
** Note that the list is not exhaustive, you may need it to add some other MIME types (google is your friend). */
const mimeTypes = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.md': 'text/plain',
    'default': 'application/octet-stream'
};

// Main method, exported at the end of the file. It's the one that will be called when a file is requested.
async function manageRequest(request, response) {
    const url = new URL(request.url, `${request.scheme}://${request.headers.host}`);
    let pathName = `.${baseFrontPath}${url.pathname}`;
    const exist = await fs.access(pathName).then(() => true).catch(() => false); // Let's check if the file exists.
    if (!exist) pathName = `.${baseFrontPath}/${defaultFileIfFolder}`; // Since it's a SPA, we will return the default file if the requested one does not exist.
    else if ((await fs.stat(pathName)).isDirectory()) pathName += `/${defaultFileIfFolder}`;  // If it is a directory, we will return the default file.
    await sendFile(pathName, response);
}

async function sendFile(pathName, response) {
    const extension = path.parse(pathName).ext ?? ".html";
    try {
        const mime = mimeTypes[extension] || mimeTypes['default'];
        const data = mime === "text/css" ? await postcss.processCSS(pathName).then(result => result.css) : await fs.readFile(pathName);
        response.setHeader('Content-type', mime);
        response.end(data);
    } catch (error) {
        console.log(`Error getting the file: ${pathName}: ${error.message}`);
        send404(pathName, response);
    }
}

function send404(path, response) {
    // Note that you can create a beautiful html page and return that page instead of the simple message below.
    response.statusCode = 404;
    response.end(`File ${path} not found!`);
}

exports.manage = manageRequest;
