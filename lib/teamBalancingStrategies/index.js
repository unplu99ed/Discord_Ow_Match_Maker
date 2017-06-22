var randomize = require("./randomize");
var splitBySR = require("./splitBySR");
var splitSrByGroups = require("./splitSrByGroups");

module.exports = {
    "randomize": new randomize(),
    "splitBySR": new splitBySR(),
    "splitSrByGroups": new splitSrByGroups(),
}