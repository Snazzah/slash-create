### With [discord.js](https://github.com/discordjs/discord.js)
```js
const { Creator, GatewayServer } = require('slash-create');
const Discord = require('discord.js');
const client = new Discord.Client();
const path = require('path');
const creator = new Creator({
  applicationID: '12345678901234567',
  publicKey: 'CLIENT_PUBLIC_KEY',
  token: 'BOT_TOKEN_HERE',
});

creator
  .withServer(
    new GatewayServer(
      (handler) => client.on('raw', (event) => {
        if (event.t === 'INTERACTION_CREATE') handler(event.d);
      })
    )
  )
  .registerCommandsIn(path.join(__dirname, 'commands'))
  .syncCommands();

client.login('BOT_TOKEN_HERE');
```
### With [eris](https://github.com/abalabahaha/eris)
```js
const { Creator, GatewayServer } = require('slash-create');
const Eris = require('eris');
const client = new Eris('BOT_TOKEN_HERE');
const path = require('path');
const creator = new Creator({
  applicationID: '12345678901234567',
  publicKey: 'CLIENT_PUBLIC_KEY',
  token: 'BOT_TOKEN_HERE',
});

creator
  .withServer(
    new GatewayServer(
      (handler) => client.on('rawWS', (event) => {
        if (event.t === 'INTERACTION_CREATE') handler(event.d);
      })
    )
  )
  .registerCommandsIn(path.join(__dirname, 'commands'))
  .syncCommands();

client.connect();
```
