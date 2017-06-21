"use strict";
const _ = require("lodash");
const shuffle = require('shuffle-array');
const owjs = require('overwatch-js');
const config = require("../config.json");
const GAME_SIZE = config.gameSize;
const DEFAULT_RANK = config.defaultRank;
const REGION = config.region;
const PLATFORM = config.platform;

class QueueMngr {

    constructor() {
        this.waitingQueue = [];
    }

    getQueueSize() {
        return this.waitingQueue.length;
    }

    getWaitingQueue() {
        return [].concat(this.waitingQueue);
    }

    getGameGroup() {
        let gameGroupResult = null;
        if (this.getQueueSize() >= GAME_SIZE) {
            gameGroupResult = this.waitingQueue.slice(0, GAME_SIZE);
            this.waitingQueue = this.waitingQueue.slice(GAME_SIZE + 1, this.waitingQueue.length);
        }

        return gameGroupResult;
    }

    addPlayerToQueue(addPlayerData) {
        return new Promise((resolve, reject) => {
            let addedPlayerResult = false;

            let playerExist = _.findIndex(this.waitingQueue, function (player) {
                return player.discordTag == addPlayerData.discordTag;
            });

            if (playerExist < 0) {
                addedPlayerResult = true;

                if (addPlayerData.battleTag && addPlayerData.battleTag !== "") {
                    owjs.getOverall(PLATFORM, REGION, addPlayerData.battleTag.replace("#", "-")).then((playerOwData) => {
                        addPlayerData.rank = (playerOwData && playerOwData.profile && playerOwData.profile.rank ? playerOwData.profile.rank : DEFAULT_RANK);
                        this.waitingQueue.push(addPlayerData);
                        resolve({"addedPlayer": addedPlayerResult});
                    }).catch(reject);
                }
                else {
                    reject("missing battle.net tag");
                    // addPlayerData.rank = DEFAULT_RANK;
                    // this.waitingQueue.push(addPlayerData);
                    // resolve({"addedPlayer": addedPlayerResult});
                }
            }
            else {
                resolve(addedPlayerResult);
            }
        });
    }

    removeUser(discordUser) {
        return _.remove(this.waitingQueue, function (user) {
            return user.discordTag == discordUser.tag;
        });
    }
}

module.exports = QueueMngr;
