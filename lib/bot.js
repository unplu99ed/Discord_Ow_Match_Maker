"use strict";
const token = "MzEzNzAwODIxOTUzMDE5OTE2.C_tePQ.rcJFff3euJXuNevvulhP6L0hr1M";
const Discord = require("discord.js");
const queueMngr = require("./QueueMngr");
const queueMngrInstance = queueMngr.getInstance();

const register = (request) => {
    var insertResult = queueMngrInstance.register(request.user.tag, request.data);
    var resultMessage = "";
    if (insertResult.addedPlayer) {
        resultMessage += request.user + " registered successfully.";
    }
    else {
        resultMessage += request.user + " already in queue.";
    }

    if (insertResult.matchDetails) {
        resultMessage += "\n";
        resultMessage += JSON.stringify(insertResult.matchDetails, null, '\t');
    }

    return resultMessage;
}

const unregister = (request) => {
    var removed = queueMngrInstance.unregister(request.user, request.data);
    return (removed.length > 0 ? request.user + " removed successfully." : null);
}

const help = (request) => {
    return "Command List:\n"
        + "!url - Link to facebook group.\n"
        + "!register - Adds you to the current matchmaking list.\n"
        + "!remove - Removes you from the current matchmaking list.\n"
        + "!status - Prints the current matchmaking list.\n"
        + "!version - The current version of the bot."
}

const version = (request) => {
    return "Current version: 1.0. All rights reserved to WarBois (c)";
}

const status = (request) => {
    let resultMessage = queueMngrInstance.status();

    if (!resultMessage) {
        resultMessage = "no active match currently";
    }

    return resultMessage;
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
                let result = factoryMapping[parsedCommand.key](parsedCommand);
                //console.log(JSON.stringify(request));
                lastChannel = msg.channel;
                if (result) {
                    msg.channel.send(result);
                }
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