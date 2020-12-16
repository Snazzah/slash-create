<div align="center">

# /create
Creator and handler for Discord's [slash commands](https://discord.com/developers/docs/interactions/slash-commands).

You can create commands similar to Discord.JS [Commando](https://github.com/discordjs/Commando).

> This package is indev and may not work properly.

</div>

## Features
- Multiple server support (Express, Fastify, etc.)
- Command syncing - Sync commands with your creator automatically.
- Load commands from a folder
- Command throttling/cooldowns

## Installation
```sh
npm i slash-create
yarn add slash-create
```

### Using webservers
In order to use a specific webserver, you will need to install the dependency associated with that server. The following server types require these dependencies:
- `ExpressServer`: `express`
- `FastifyServer`: `fastify`

## Example

#### Creating a SlashCreator
```js
const { Creator } = require('slash-create');
const creator = new Creator({
  applicationID: '12345678901234567',
  publicKey: 'CLIENT_PUBLIC_KEY',
  token: 'BOT_TOKEN_HERE',
});
```

#### Adding commands and syncing them
```js
const path = require('path');

creator
    // Registers all of your commands in the ./commands/ directory
    .registerCommandsIn(path.join(__dirname, 'commands'));
    // This will sync commands to Discord, it must be called after commands are loaded.
    // This also returns itself for more chaining capabilities.
    .syncCommands();
```

#### Adding a webserver
```js
const { ExpressServer } = require('slash-create');
const path = require('path');

creator
    .withServer(new ExpressServer())
    // Depending on what server is used, this may not be needed.
    .startServer();

/**
 * You can also initialize the server with an existing application.
 * If you are doing this with express applications, the express application must already have `express.json()` as middleware.
 */

creator
    // Set `alreadyListening` if the server has already started.
    .withServer(new ExpressServer(app, { alreadyListening: true }));
```

##### Resources & References
This project borrows resources and references from the following repositories:
- [dbots.js](https://github.com/dbots-pkg/dbots.js)
- [eris](https://github.com/abalabahaha/eris)
- [discord.js](https://github.com/discordjs/discord.js)
- [Commando](https://github.com/discordjs/Commando)
- [slash-worker](https://github.com/A5rocks/slash-worker)
- [slash-commands](https://github.com/MeguminSama/discord-slash-commands)
- [discord-interactions](https://github.com/discord/discord-interactions-js)
