"use strict";
const _ = require("lodash");
const shuffle = require('shuffle-array');
const owjs = require('overwatch-js');
const GAME_SIZE = 2;
const GROUP_SIZE = GAME_SIZE / 2;
const DEAFULT_RANK = 1500;
module.exports = {getInstance: getInstance};


function getInstance() {
    var self = this;
    let waitingQueue = [];
    let currentGameStatus = null;

    function prepareMatch() {
        let gameCollection = waitingQueue.slice(0, GAME_SIZE);
        waitingQueue = waitingQueue.slice(GAME_SIZE + 1, waitingQueue.length);
        shuffle(gameCollection);
        saveLastGame(gameCollection);
        return currentGameStatus;
    }

    function formatPlayersCollectionForDisplay(collection) {
        let displayGameCollection = [];
        collection.forEach(player => {
            displayGameCollection.push(player.discordUser + " SR " + player.rank);
        });

        return displayGameCollection;
    }

    function saveLastGame(gameCollection) {
        let gameCollectionForDisplay = formatPlayersCollectionForDisplay(gameCollection);
        let currentGame = {
            "TeamBlue": [].concat(gameCollectionForDisplay).slice(0, GROUP_SIZE),
            "TeamRed": [].concat(gameCollectionForDisplay).slice(GROUP_SIZE, GAME_SIZE),
        }

        currentGameStatus = "**Game Details :**";
        currentGameStatus += "\n";
        currentGameStatus += JSON.stringify(currentGame, null, "\t");
    }

    function addPlayerToQueue(addPlayerData) {
        let promise = new Promise(function (resolve, reject) {
            let resultAddPlayer = false;

            let playerExist = _.findIndex(waitingQueue, function (player) {
                return player.discordTag == addPlayerData.discordTag;
            })
            if (playerExist < 0) {
                owjs.getOverall('pc', 'eu', addPlayerData.battleTag.replace("#", "-")).then(function (playerOwData) {
                    addPlayerData.rank = (playerOwData && playerOwData.profile && playerOwData.profile.rank ? playerOwData.profile.rank : DEAFULT_RANK);
                    waitingQueue.push(addPlayerData);
                    resultAddPlayer = true;
                    resolve(resultAddPlayer)
                })
                    .catch(reject)
            }
            else {
                resolve(resultAddPlayer)
            }
        })
        return promise;
    }

    self.register = function (discordUser, battleTag) {
        let promise = new Promise(function (resolve, reject) {
            let result = {
                addedPlayer: false,
                matchDetails: null
            };

            var addPlayerData = {
                "discordTag": discordUser.tag,
                "discordUser": discordUser,
                "battleTag": battleTag
            };

            addPlayerToQueue(addPlayerData).then(function (addedResult) {
                result.addedPlayer = addedResult;
                if (waitingQueue.length == GAME_SIZE) {
                    result.matchDetails = prepareMatch();
                }

                resolve(result);
            })
                .catch(reject)

        });

        return promise;
    }

    let removefromArray = function (collection, discordAuthor, battleTag) {
        return _.remove(collection, function (user) {
            return user.discordAuthor == discordAuthor && user.battleTag == battleTag
        });
    };

    self.unregister = function (discordAuthor, battleTag) {
        var removed;
        removed = removefromArray(gameCollection, discordAuthor, battleTag);
        return removed
    }

    self.status = function () {
        return {
            "currentStatus": currentGameStatus,
            "waitingQueue": formatPlayersCollectionForDisplay(waitingQueue).toString(),
        };
    }

    return self
}