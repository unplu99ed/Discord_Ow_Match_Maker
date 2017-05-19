# Discord_Ow_Match_Maker - A discord bot to create gathers, specificly for Overwatch
Version 0.2.0

A gather is a custom game made for 12 random (or not random) players and they play with and against eachother.
The idea is simple. Once the bot is activated, it will take care of registering the players and dividing them into 2 teams.

Current supported commands:

!register - register the player to the queue
!remove 	- remove the player from the queue
!status 	- displays the current players registered to the queue
!url 		  - posts a link to our Overwatch Facebook Group and to our Github page
!version	- shows the current bot version

Installation:
1. download nodeJS from https://nodejs.org/en/download/
2. run npm -g install npm to be on the latest version
3. Create your own bot on discord site (Check google/youtube if you are not familiar with how to do it)
4. Download the files
5. run npm install in the downloaded project folder
6. Change the TOKEN in the config file.
7. Run the bot with the command of "node app"

Once activated, the bot will run until terminated.

How this bot works:

In order to register, a player MUST type !register <Battle tag> for example: !register Kaffa#12345. (Otherwise, registration wont
work and an error will be displayed). 
If a player wants to leave the queue, he should type !remove.
!status will print the current players registered into the queue.
When the list fills with 12 players (Changeable in config file), the bot will create 2 teams. Current version supports Random Shuffle
for the players. We also plan on adding a balancing system - see Future Plans.
A message will now be displayed, showing the team players along with their SR. (Yes, we use Battle.net API to fetch SR information by Btag)
Now, a player must create a custom game, set the rules currectly and invite all the players into the game.
All players must manually move to their respective gather channel (Team1, Team 2), the bot will not open such channels or move players to it.
Meanwhile on discord, players can keep registering to a new queue which will start a new game once reached 12 players.
The bot can spot when a player has gone offline/idle/dnd and automatically remove him from the list.
It will also check if a player is already in the list and will not add him again.



Future plans:
Balance teams by SR. (High Priority)
Balance teams by main roles played.
Random map chosen by the bot.
Specific map chosen by the admin.
Allow admin to quickly change the game size from 12 to any even number below it.
Allow the admin to change the need for Battle Tag (Low priority)
Cosmetic changes to the bot

