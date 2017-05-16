"use strict";
const _ = require("lodash");
const shuffle = require('shuffle-array');
const GAME_SIZE = 2;
const GROUP_SIZE = GAME_SIZE / 2;

module.exports = {getInstance: getInstance};


function getInstance() {
    var self = this;
    let waitingQueue = [];
    let currentStatus = null;

    function prepareMatch() {
        let gameCollection = waitingQueue.slice(0, GAME_SIZE);
        waitingQueue = waitingQueue.slice(GAME_SIZE + 1, waitingQueue.length);
        shuffle(gameCollection);
        saveLastGame(gameCollection);
        return currentStatus;
    }

    function saveLastGame(gameCollection) {
        let desplayGameCollection = [];
        gameCollection.forEach(player => {
            desplayGameCollection.push(player.discordTag);
        });
        currentStatus = {
            "TeamBlue": [].concat(gameCollection).slice(0, GROUP_SIZE),
            "TeamRed": [].concat(gameCollection).slice(GROUP_SIZE, GAME_SIZE),
        }
    }

    function addPlayerToQueue(addPlayerData) {
        var resultAddPlayer = false;

        var playerExist = _.findIndex(waitingQueue, function (player) {
            return player.discordTag == addPlayerData.discordTag;
        })
        if (playerExist < 0) {
            waitingQueue.push(addPlayerData);
            resultAddPlayer = true;
        }

        return resultAddPlayer;
    }

    self.register = function (discordTag, battleTag) {
        let result = {
            addedPlayer: false,
            matchDetails: null
        };

        var addPlayerData = {
            "discordTag": discordTag,
            "battleTag": battleTag
        };

        result.addedPlayer = addPlayerToQueue(addPlayerData);

        if (waitingQueue.length == GAME_SIZE) {
            result.matchDetails = prepareMatch();
        }

        return result;
    }

    let removefromArray = function (collection, discordAuthor, battleTag) {
        return _.remove(collection, function (user) {
            return user.discordAuthor == discordAuthor && user.battleTag == battleTag
        });
    };

    self.unregister = function (discordAuthor, battleTag) {
        var removed;
        removed = removefromArray(gameCollection, discordAuthor, battleTag);
        removed = removed.concat(removefromArray(gameCollection, discordAuthor, battleTag));
        return removed
    }

    self.status = function () {
        return JSON.stringify(currentStatus);
    }

    return self
}