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
        this.gameQueue = new queueMngr(this.prepareMatch);
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
                //result.addedPlayer = result.addedPlayerResult;
                if (result.haveMatch) {
                    this.currentGameStatus = result.matchDetails;
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
        return {
            "currentStatus": this.displayFormatGame(this.currentGameStatus),
            "waitingQueue": this.getFormaterCollection(this.gameQueue.getWaitingQueue()),
        };
    }

    prepareMatch(gameDetails) {
        let matchDetailsResult = teamBalancingStrategies[defaultTeamBalancingStrategies].balance(gameDetails);
        this.currentGameStatus = [].concat(matchDetailsResult);
        return matchDetailsResult;
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