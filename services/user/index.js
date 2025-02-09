const http = require("http");
const userDatabase = require("./js/userDatabase.js");

http.createServer(function (request, response) {
    let filePath = request.url.split("/").filter(function (elem) {
        return elem !== "..";
    });

    if (filePath[3] === "sign-up") {
        handleSignUp(request, response);
    } else if (filePath[3] === "sign-in") {
        handleSignIn(request, response);
    } else if (filePath[3] === "check-token") {
        handleCheckToken(request, response);
    } else {
        response.statusCode = 404;
        response.end();
    }
}).listen(8004);


function handleSignUp(request, response) {
    let body = "";
    request.on("data", chunk => {
        body += chunk.toString();
    });
    request.on("end", async () => {
        try {
            const parsedBody = JSON.parse(body);
            console.log(parsedBody);
            response.setHeader("Content-Type", "application/json");
            const result = await userDatabase.addUser(parsedBody.username, parsedBody.password);
            response.end(JSON.stringify(result));
        } catch (error) {
            response.statusCode = 400;
            response.end(JSON.stringify({error: "Invalid JSON"}));
        }
    });
}

function handleSignIn(request, response) {
    let body = "";
    request.on("data", chunk => {
        body += chunk.toString();
    });
    request.on("end", async () => {
        try {
            const parsedBody = JSON.parse(body);
            response.setHeader("Content-Type", "application/json");
            const user = await userDatabase.getUser(parsedBody.username, parsedBody.password);
            response.end(JSON.stringify(user));
        } catch (error) {
            response.statusCode = 400;
            response.end(JSON.stringify({error: "Invalid JSON"}));
        }
    });
}


function handleCheckToken(request, response) {
    let body = "";
    request.on("data", chunk => {
        body += chunk.toString();
    });
    request.on("end", async () => {
        try {
            const parsedBody = JSON.parse(body);
            response.setHeader("Content-Type", "application/json");
            const result = await userDatabase.checkToken(parsedBody.sessionToken);
            response.statusCode = 200;
            response.end(JSON.stringify({valid: result}));
        } catch (error) {
            response.statusCode = 400;
            response.end(JSON.stringify({error: "Invalid JSON"}));
        }
    });
}