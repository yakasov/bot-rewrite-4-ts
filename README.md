# bot-rewrite-3-ts

Discord bot written in Typescript for use with Node.js.

## Features
- sending Happy Birthday messages
- replacing Twitter/X links with better embedding versions
- contains a full ranking system for users to gauge their activity in the guild
- ability to talk to the ChatGPT API
- ability to query Minecraft servers
- improved Scryfall card searching functionality
- automatic Fortnite store querying
- additional basic bot features such as /say, /claim for roles, etc

## Running

To run on your own guild, create a `config.json` file in `resources` (based off the template available in this folder) and edit the values to your needs. 
You will also need to fill out your `.env` file - there is also a template for this.

The user statistics functionality now runs off of a connected MariaDB database - if you don't want to use this, and instead prefer to use a local file, either
- use [bot-rewrite-3-js](https://github.com/yakasov/bot-rewrite-3-js), which does not have database functionality but is otherwise functionally similiar, or
- wait until a database-less version is available (it's on the TODO list)

Several scripts exist to aid in running the bot:
- if you come from `bot-rewrite-3-js`, run `npm run convert-stats` to convert an old `stats.json` to the new format.
- if you have a blank database ready for use, run `npm run setup-db` to create the appropriate tables.
- to run the bot, I would recommend `npm run dev` - but you can also use `npm run build && npm run start` to run a version with a compiled .js file.

bot-rewrite-4-ts comes with [Jest](https://jestjs.io/) testing built in, although coverage is currently lacking on the commands front.

## Contributing

Please feel free to create pull requests for any minor annoyances. You can use this bot however you want. Thanks!
