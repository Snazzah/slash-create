<div align="center">

<img src="/static/textlogo.png" height="50">

[![NPM version](https://img.shields.io/npm/v/slash-create?maxAge=3600)](https://www.npmjs.com/package/slash-create) [![NPM downloads](https://img.shields.io/npm/dt/slash-create?maxAge=3600)](https://www.npmjs.com/package/slash-create) [![ESLint status](https://github.com/Snazzah/slash-create/workflows/ESLint/badge.svg)](https://github.com/Snazzah/slash-create/actions?query=workflow%3A%22ESLint%22) [![DeepScan grade](https://deepscan.io/api/teams/11596/projects/15103/branches/297399/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=11596&pid=15103&bid=297399) [![discord chat](https://img.shields.io/discord/311027228177727508?logo=discord&logoColor=white)](https://snaz.in/discord)

Creator and handler for Discord's [slash commands](https://discord.com/developers/docs/interactions/slash-commands).

You can create commands similar to Discord.JS [Commando](https://github.com/discordjs/Commando).


</div>

## Features
- Multiple server support ([Express](http://expressjs.com/), [Fastify](https://fastify.io/), etc.)
- Hook into an existing Discord bot client
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
- `GatewayServer`: none, see [example](https://slash-create.js.org/#/docs/main/latest/examples/discord-bot)
- `GCFServer`: none technically, meant for use with [`@google-cloud/functions-framework`](https://npm.im/@google-cloud/functions-framework), see [example](https://slash-create.js.org/#/docs/main/latest/examples/gcf)

## Example

### Creating a SlashCreator
```js
const { SlashCreator } = require('slash-create');
const creator = new SlashCreator({
  applicationID: '12345678901234567',
  publicKey: 'CLIENT_PUBLIC_KEY',
  token: 'BOT_TOKEN_HERE',
});
```

### Adding commands and syncing them
```js
const path = require('path');

creator
    // Registers all of your commands in the ./commands/ directory
    .registerCommandsIn(path.join(__dirname, 'commands'))
    // This will sync commands to Discord, it must be called after commands are loaded.
    // This also returns itself for more chaining capabilities.
    .syncCommands();
```

### Adding a webserver
```js
const { ExpressServer } = require('slash-create');
const path = require('path');

creator
    .withServer(new ExpressServer())
    // Depending on what server is used, this may not be needed.
    .startServer();

/**
 * By default, this serves to `127.0.0.1:80/interactions`.
 * You can change the `serverPort` and `endpointPath` to affect where to serve to.
 */

/**
 * You can also initialize the server with an existing application.
 * If you are doing this with express applications, the express application must already have `express.json()` as middleware.
 */

creator
    // Set `alreadyListening` if the server has already started.
    .withServer(new ExpressServer(app, { alreadyListening: true }));
```

### Using a Discord Bot with /create
```js
const { GatewayServer } = require('slash-create');
const Discord = require('discord.js');
const client = new Discord.Client();

creator
  .withServer(
    new GatewayServer(
      (handler) => client.ws.on('INTERACTION_CREATE', handler)
    )
  );

client.login('BOT_TOKEN_HERE');
```

### Example Command
```js
const { SlashCommand } = require('slash-create');

module.exports = class HelloCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'hello',
      description: 'Says hello to you.'
    });
    this.filePath = __filename;
  }

  async run(ctx) {
    return `Hello, ${ctx.member.displayName}!`;
  }
}
```

## Useful Links
- [**Discord Documentation on Slash Commands**](https://discord.com/developers/docs/interactions/slash-commands)
- [Website](https://slash-create.js.org/) ([source](https://github.com/Snazzah/slash-create-website))
- [Documentation](https://slash-create.js.org/#/docs/main/latest/general/welcome)
- [Commands Template](https://github.com/Snazzah/slash-create-template)
- [GitHub](https://github.com/Snazzah/slash-create)
- [NPM](https://www.npmjs.com/package/slash-create)

<div align="center">
    <a target="_blank" href="https://snaz.in/discord" title="Join the Discord!">
        <img  src="https://discordapp.com/api/guilds/311027228177727508/widget.png?style=banner2" height="76px" draggable="false" alt="Join the Discord!">
    </a>
</div>

##### Resources & References
This project borrows resources and references from the following repositories:
- [dbots.js](https://github.com/dbots-pkg/dbots.js)
- [eris](https://github.com/abalabahaha/eris)
- [discord.js](https://github.com/discordjs/discord.js)
- [Commando](https://github.com/discordjs/Commando)
- [slash-worker](https://github.com/A5rocks/slash-worker)
- [slash-commands](https://github.com/MeguminSama/discord-slash-commands)
- [discord-interactions](https://github.com/discord/discord-interactions-js)
