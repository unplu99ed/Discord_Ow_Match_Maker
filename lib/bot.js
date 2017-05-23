"use strict";
// const token = "Add You Key";
const config = require("../config.json");
const token = config.token;

const Discord = require("discord.js");
let gameMatchMaker = require("./gameMatchMaker");
let gameMatchMakerInstance = new gameMatchMaker();

function displayGame(matchDetails) {
    let resultMessage;
    resultMessage = "\n**Game Details :**\n";
    resultMessage += JSON.stringify(matchDetails, null, "\t");
    return resultMessage;
};

const register = (request) => {
    let promise = new Promise(function (resolve, reject) {
        let resultMessage = "";
        gameMatchMakerInstance.register(request.user, request.data).then(function (insertResult) {
            if (insertResult.addedPlayer) {
                resultMessage += request.user + " registered successfully.";
            }
            else {
                resultMessage += request.user + " already in queue.";
            }

            if (insertResult.matchDetails) {
                resultMessage += displayGame(insertResult.matchDetails);
            }
            resolve(resultMessage);

        }).catch(function (errorMessage) {
            resultMessage = request.user + " registration failed due to " + errorMessage;
            resolve(resultMessage);

        });
    });

    return promise;
}

const unregister = (request) => {
    let promise = new Promise(function (resolve, reject) {
        var removed = gameMatchMakerInstance.unregister(request.user, request.data);
        resolve((removed.length > 0 ? request.user + " removed successfully." : null));
    });
    return promise;
}

const version = (request) => {
    let promise = new Promise(function (resolve, reject) {
        resolve("Current version: 1.0. All rights reserved to WarBois (c)");
    });
    return promise;
}

const status = (request) => {
    let promise = new Promise(function (resolve, reject) {
        let status = gameMatchMakerInstance.status();
        var resultMessage = "";

        if (!status.currentStatus) {
            resultMessage = "No item matches";
        }
        else {
            resultMessage = displayGame(status.currentStatus)
        }

        if (status.waitingQueue) {
            resultMessage += "\nWaiting queue (" + status.waitingQueue.length + "):" + status.waitingQueue;
        }

        resolve(resultMessage);
    });
    return promise;
}

const url = (request) => {
    let promise = new Promise(function (resolve, reject) {
        let resultMessage = "Facebook Group: https://www.facebook.com/groups/owisr20/ \n"
            + "Git: https://github.com/unplu99ed/Discord_Ow_Match_Maker";

        resolve(resultMessage);
    });
    return promise;
}

const help = (request) => {
    let promise = new Promise(function (resolve, reject) {
        var helpResult = "Command List:\n"
            + "!url - Link to facebook group.\n"
            + "!register - Adds you to the current matchmaking list.\n"
            + "!remove - Removes you from the current matchmaking list.\n"
            + "!status - Prints the current matchmaking list.\n"
            + "!version - The current version of the bot."
        resolve(helpResult);
    });

    return promise;
}

const commandsMapping = {
    '!register': register,
    '!remove': unregister,
    '!version': version,
    '!help': help,
    "!status": status,
    "!url": url
};

function parseCommand(msg) {
    let spaceIndex = (msg.content.includes(" ") ? msg.content.indexOf(" ") : msg.content.length);
    let parsedCommandResult = {
        key: msg.content.toString().slice(0, spaceIndex),
        data: msg.content.toString().slice(spaceIndex + 1, msg.content.length),
        user: msg.author,
    };

    return parsedCommandResult;
}

module.exports = function () {

    const client = new Discord.Client();
    let lastChannel = null;
    let isBotConnect = false;

    client.on('ready', () => {
        console.log(`Logged in as ${client.user.username}!`);
    });

    client.on('message', function (msg) {
        if (msg.content[0] === "!") {
            let parsedCommand = parseCommand(msg);
            if (commandsMapping[parsedCommand.key]) {
                commandsMapping[parsedCommand.key](parsedCommand)
                    .then(function (result) {
                        lastChannel = msg.channel;
                        if (result) {
                            msg.channel.send(result);
                        }
                    })
            }
        }
    });

    client.on("presenceUpdate", function (oldMember, newMember) {
        if (newMember.presence.status !== "online") {
            let user = newMember.user;
            commandsMapping["!remove"]({"user": user, "data": ""})
                .then(function (result) {
                    if (result) {
                        console.log(user.username + "@" + user.discriminator + " " + result);
                    }
                });
        }

    })

    client.login(token).then(function () {
        isBotConnect = true;
    });

    function logout() {
        if (isBotConnect) {
            console.log("destroy Bot");
            client.destroy().then(function (data) {
                isBotConnect = false;
                process.exit(0);
            });
        }
    }

    process.on('exit', logout);
    process.on('SIGINT', logout);
    process.on('uncaughtException', logout);
}