"use strict";
const _ = require("lodash");
const owjs = require('overwatch-js');
const config = require("../config.json");
const GAME_SIZE = config.gameSize;
const GROUP_SIZE = GAME_SIZE / 2;
const DEFAULT_RANK = config.defaultRank;
const REGION = config.region;
const PLATFORM = config.platform;
const CURRENT_GAME_CLEAR_TIME_OUT = config.currentGameClearInMin * 60 * 1000;
const defaultTeamBalancingStrategies = config.defaultTeamBalancingStrategies;
let queueMngr = require("./queueMngr");
let teamBalancingStrategies = require("./teamBalancingStrategies/index");

class gameMatchMaker {

    constructor() {
        this.currentGameStatus = null;
        this.gameQueue = new queueMngr();
        this.currentClearCurrentGame = null;
    }

    getFormaterCollection(collection) {
        let displayGameCollection = [];
        collection.forEach(player => {
            displayGameCollection.push(player.discordUser + " " + player.battleTag + " " + player.rank + "SR");
        });

        return displayGameCollection;
    }

    setTimeOutForCurrentGame() {
        if (!!this.currentClearCurrentGame) {
            clearTimeout(this.currentClearCurrentGame);
        }

        this.currentClearCurrentGame = setTimeout(() => {
            this.currentGameStatus = null;
        }, CURRENT_GAME_CLEAR_TIME_OUT)
    }

    handleCurrentGame(gameGroup) {
        this.currentGameStatus = teamBalancingStrategies[defaultTeamBalancingStrategies].balance(gameGroup);
        this.setTimeOutForCurrentGame();
        return this.displayFormatGame(this.currentGameStatus);

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
                if (result.addedPlayer && this.gameQueue.getQueueSize() >= GAME_SIZE) {
                    let gameGroup = this.gameQueue.getGameGroup();
                    result.matchDetails = this.handleCurrentGame(gameGroup);
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
        return teamBalancingStrategies[defaultTeamBalancingStrategies].balance(gameDetails);
    }

    displayFormatGame(gameCollection) {
        let result = null;
        if (gameCollection) {
            let gameCollectionForDisplay = this.getFormaterCollection(gameCollection);
            let teamBlueTitle = "TeamBlue (" + parseInt(_.sumBy([].concat(gameCollection).slice(0, GROUP_SIZE), 'rank') / GROUP_SIZE) + ")";
            let teamRedTitle = "TeamRed (" + parseInt(_.sumBy([].concat(gameCollection).slice(GROUP_SIZE, GAME_SIZE), 'rank') / GROUP_SIZE) + ")";
            // let currentGame = {
            //     "TeamBlue": [].concat(gameCollectionForDisplay).slice(0, GROUP_SIZE),
            //     "TeamRed": [].concat(gameCollectionForDisplay).slice(GROUP_SIZE, GAME_SIZE),
            // };
            let currentGame = {};
            currentGame[teamBlueTitle] = [].concat(gameCollectionForDisplay).slice(0, GROUP_SIZE);
            currentGame[teamRedTitle] = [].concat(gameCollectionForDisplay).slice(GROUP_SIZE, GAME_SIZE);
            result = currentGame;
        }

        return result;
    }
}

module.exports = gameMatchMaker;