"use strict";
const token = "Add You Key";

const Discord = require("discord.js");
const queueMngr = require("./QueueMngr");
const queueMngrInstance = queueMngr.getInstance();

const register = (request) => {
    let promise = new Promise(function (resolve, reject) {
        queueMngrInstance.register(request.user, request.data).then(function (insertResult) {
            let resultMessage = "";
            if (insertResult.addedPlayer) {
                resultMessage += request.user + " registered successfully.";
            }
            else {
                resultMessage += request.user + " already in queue.";
            }

            if (insertResult.matchDetails) {
                resultMessage += "\n";
                resultMessage += insertResult.matchDetails;
            }
            resolve(resultMessage);
        });
    });

    return promise;
}

const unregister = (request) => {
    let promise = new Promise(function (resolve, reject) {
        var removed = queueMngrInstance.unregister(request.user, request.data);
        resolve((removed.length > 0 ? request.user + " removed successfully." : null));
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

const version = (request) => {
    let promise = new Promise(function (resolve, reject) {
        resolve("Current version: 1.0. All rights reserved to WarBois (c)");
    });
    return promise;
}

const status = (request) => {
    let promise = new Promise(function (resolve, reject) {
        let status = queueMngrInstance.status();
        var resultMessage = "";

        if (!status.currentStatus) {
            resultMessage = "no active match currently";
        }
        else {
            resultMessage = status.currentStatus;
        }

        if (status.waitingQueue) {
            resultMessage += "\nWaiting queue:" + status.waitingQueue;
        }

        resolve(resultMessage);
    });
    return promise;
}

const factoryMapping = {
    '!register': register,
    '!remove': unregister,
    '!version': version,
    '!help': help,
    "!status": status,
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

    client.on('ready', () => {
        console.log(`Logged in as ${client.user.username}!`);
    });

    client.on('message', function (msg) {
        if (msg.content[0] === "!") {
            let parsedCommand = parseCommand(msg);
            if (factoryMapping[parsedCommand.key]) {
                factoryMapping[parsedCommand.key](parsedCommand)
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
            let result = factoryMapping["!remove"]({"user": newMember.user.tag, "data": ""});
            if (result && lastChannel) {
                lastChannel.send(result);
            }
        }

    })

    client.login(token);
}