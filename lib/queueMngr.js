"use strict";
const _ = require("lodash");
const shuffle = require('shuffle-array');
const owjs = require('overwatch-js');
const config = require("../config.json");
const GAME_SIZE = config.gameSize;
const GROUP_SIZE = GAME_SIZE / 2;
const DEFAULT_RANK = config.defaultRank;
const REGION = config.region;
const PLATFORM = config.platform;


class QueueMngr {

    constructor(notifyOnGameGroup) {
        this.waitingQueue = [];
        this.notifyOnGameGroup = notifyOnGameGroup;
    }

    getQueueSize() {
        return this.waitingQueue.length;
    }

    getWaitingQueue() {
        return [].concat(this.waitingQueue);
    }

    addPlayerToQueue(addPlayerData) {
        let self = this;
        let promise = new Promise((resolve, reject) => {
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
                        let haveMatch = this.getQueueSize() >= GAME_SIZE;
                        let matchDetails = null;
                        if (haveMatch) {
                            let gameGroupCollection = this.waitingQueue.slice(0, GAME_SIZE);
                            this.waitingQueue = this.waitingQueue.slice(GAME_SIZE + 1, this.waitingQueue.length);
                            matchDetails = this.notifyOnGameGroup(gameGroupCollection);
                        }
                        resolve({
                            "addedPlayer": addedPlayerResult,
                            "haveMatch": haveMatch,
                            "matchDetails": matchDetails,
                        });
                    }).catch(reject);
                }
                else {
                    reject("missing battle.net tag");
                }
            }
            else {
                resolve(addedPlayerResult);
            }
        });
        return promise;
    }

    removeUser(discordUser) {
        return _.remove(this.waitingQueue, function (user) {
            return user.discordTag == discordUser.tag;
        });
    }
}

module.exports = QueueMngr;
