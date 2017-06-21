"use strict";
const _ = require("lodash");


let splitBySR = class {

    balance(teamCollection) {
        let teamA = [];
        let teamB = [];

        teamCollection = _.orderBy(teamCollection, "rank", ["desc"]);

        while (teamCollection.length > 0) {
            if (teamCollection.length >= 4) {
                teamA = teamA.concat(this.takeFirstAndLastFromCollection(teamCollection));
                teamB = teamB.concat(this.takeFirstAndLastFromCollection(teamCollection));
            }
            else {
                teamA.push(teamCollection.shift());
                teamB.push(teamCollection.shift());
            }

        }

        teamA = _.orderBy(teamA, "rank", ["desc"]);

        teamB = _.orderBy(teamB, "rank", ["desc"]);

        return teamA.concat(teamB);

    }

    takeFirstAndLastFromCollection(collection) {
        let resultCollection = [];
        resultCollection.push(collection.shift());
        resultCollection.push(collection.pop());

        return resultCollection;
    }

}

module.exports = splitBySR;