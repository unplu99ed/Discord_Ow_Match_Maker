"use strict";
const _ = require("lodash");
const owjs = require('overwatch-js');
const config = require("../config.json");
const GAME_SIZE = config.gameSize;
const GROUP_SIZE = GAME_SIZE / 2;
const DEFAULT_RANK = config.defaultRank;
const REGION = config.region;
const PLATFORM = config.platform;
const defaultTeamBalancingStrategies = config.defaultTeamBalancingStrategies;
let queueMngr = require("./queueMngr");
let teamBalancingStrategies = require("./teamBalancingStrategies/index");

class gameMatchMaker {

    constructor() {
        this.currentGameStatus = null;
        this.gameQueue = new queueMngr();
    }

    getFormaterCollection(collection) {
        let displayGameCollection = [];
        collection.forEach(player => {
            displayGameCollection.push(player.discordUser + " " + player.rank + "SR");
        });

        return displayGameCollection;
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

            this.gameQueue.addPlayerToQueue(addPlayerData).then((result) => {
                if (result.addedPlayer && this.gameQueue.getQueueSize() >= GAME_SIZE){
                    let gameGroup = this.gameQueue.getGameGroup();
                    this.currentGameStatus = teamBalancingStrategies[defaultTeamBalancingStrategies].balance(gameGroup);
                    result.matchDetails = this.displayFormatGame(this.currentGameStatus);
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
        let currentStatus = this.displayFormatGame(this.currentGameStatus);
        return {
            "currentStatus": null,
            "waitingQueue": this.getFormaterCollection(this.gameQueue.getWaitingQueue()),
        };
    }

    prepareMatch(gameDetails) {
        return teamBalancingStrategies[defaultTeamBalancingStrategies].balance(gameDetails);
    }

    displayFormatGame(gameCollection) {
        let result = null;
        if (gameCollection) {
            let gameCollectionForDisplay = this.getFormaterCollection(gameCollection);
            let currentGame = {
                "TeamBlue": [].concat(gameCollectionForDisplay).slice(0, GROUP_SIZE),
                "TeamRed": [].concat(gameCollectionForDisplay).slice(GROUP_SIZE, GAME_SIZE),
            };
            result = currentGame;
        }

        return result;
    }
}

module.exports = gameMatchMaker;