"use strict";
const _ = require("lodash");


let splitBySR = class {

    balance(teamCollection) {
        let teamA = [];
        let teamB = [];

        teamCollection = _.orderBy(teamCollection, [function (player) {
            return player.rank;
        }], ["desc"]);

        while (teamCollection.length > 0) {

            if (this.getTeamAverage(teamA) >= this.getTeamAverage(teamB)) {
                this.singTwoStrongPlayersToTeams(teamCollection, teamB, teamA);
            }
            else {
                this.singTwoStrongPlayersToTeams(teamCollection, teamA, teamB);
            }

        }

        teamA = _.orderBy(teamA, "rank", ["desc"]);

        teamB = _.orderBy(teamB, "rank", ["desc"]);

        return teamA.concat(teamB);

    }

    getTeamAverage(teamCollection) {
        return (teamCollection.length ? parseInt(_.sumBy(teamCollection, 'rank') / teamCollection.length) : 0 );
    }

    singTwoStrongPlayersToTeams(playersCollection, team1, team2) {
        team1.push(playersCollection.shift());
        team2.push(playersCollection.shift());
    }
}

module
    .exports = splitBySR;