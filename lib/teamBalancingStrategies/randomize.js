const shuffle = require('shuffle-array');

let rondomise = class {

    balance(teamCollection) {
        shuffle(teamCollection);
        return teamCollection;
    }

}

module.exports = rondomise;