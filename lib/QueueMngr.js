"use strict";
const _ = require("lodash");
const shuffle = require('shuffle-array');
const GAME_SIZE = 2;
const GROUP_SIZE = GAME_SIZE/2;

module.exports = {getInstance: getInstance};


function getInstance() {
    var self = this;
    let gameCollection = [];
    let queue = [];
    let currentStatus = null;

    function prepareMatch() {
        shuffle(gameCollection);
        currentStatus =  {
            "TeamBlue": [].concat(gameCollection).slice(0, GROUP_SIZE),
            "TeamRed": [].concat(gameCollection).slice(GROUP_SIZE, GAME_SIZE),
        }
    }

    self.register = function (discordAuthor, battleTag) {
        if (gameCollection.length < GAME_SIZE) {
            gameCollection.push({
                "discordAuthor": discordAuthor.tag,
                "battleTag": battleTag
            });

            if (gameCollection.length == GAME_SIZE) {
                return prepareMatch();
            }
        }
        else {
            queue.push({
                "discordAuthor": discordAuthor,
                "battleTag": battleTag
            });
        }
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

    self.status = function() {
        return JSON.stringify(currentStatus);
    }

    return self
}