/**
 * Created by DarO on 18/05/2017.
 */
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
let queueMngr = require("./queueMngr");

class gameMatchMaker {

    constructor() {
        this.currentGameStatus = null;
        this.gameQueue = new queueMngr();
    }

    register(discordUser, battleTag) {
        let promise = new Promise((resolve, reject) => {
            let result = {
                addedPlayer: false,
                matchDetails: null
            };

            var addPlayerData = {
                "discordTag": discordUser.tag,
                "discordUser": discordUser,
                "battleTag": battleTag
            };

            this.gameQueue.addPlayerToQueue(addPlayerData).then((addedResult) => {
                result.addedPlayer = addedResult;
                if (this.gameQueue.getQueueSize() == GAME_SIZE) {
                    result.matchDetails = this.prepareMatch();
                }

                resolve(result);

            }).catch(reject)

        });

        return promise;
    }

    unregister(discordAuthor, battleTag) {
        return this.gameQueue.removeUser(discordAuthor);
    }

    status() {
        return {
            "currentStatus": this.currentGameStatus,
            "waitingQueue": this.gameQueue.getFormaterWaitingQueue(),
        };
    }

    prepareMatch() {
        let gameCollection = this.waitingQueue.slice(0, GAME_SIZE);
        this.waitingQueue = this.waitingQueue.slice(GAME_SIZE + 1, this.waitingQueue.length);
        shuffle(gameCollection);
        this.saveLastGame(gameCollection);
        return this.currentGameStatus;
    }

    saveLastGame(gameCollection) {
        let gameCollectionForDisplay = formatPlayersCollectionForDisplay(gameCollection);
        let currentGame = {
            "TeamBlue": [].concat(gameCollectionForDisplay).slice(0, GROUP_SIZE),
            "TeamRed": [].concat(gameCollectionForDisplay).slice(GROUP_SIZE, GAME_SIZE),
        };

        this.currentGameStatus = currentGame;
    }
}

module.exports = gameMatchMaker;