# FAQ

## Terminology

### What are **initial messages**?
Any first response sent out during the "Sending command..." message. The initial response can be a plain message or a deferred message.

### What is a **deferred message**?
A deferred message is an acknowlegement that the message will soon be edited later on. A deferred message has been sent if the response is the "Bot is thinking..." message.

## Common Problems

### `ts-node` can't load commands from folders!
`ts-node` only compiles other TypeScript files that are imported directly and because of this, no other files are compiled and therefore not recognized. You will need to use `tsc` in order to compile everything or try [ts-devscript](https://npm.im/ts-devscript) for development environments.

### My attachments aren't showing!
Attachments cannot be sent within **ephemeral messages** and **initial messages**. You should also make sure that the files are sending **buffers**.

```js
ctx.send({
  content: 'hello',
  file: {
    name: 'avatar.png',
    file: fs.readFileSync('avatar.png')
  }
});
```

## External Libraries

### How can I get the client from my slash command?
slash-create does not support passing a client through the command context, since the library is also used for webservers.
You can do either of the following work-arounds:

#### Extend the Command Class
This requires you to manually register the command as `registerCommandsIn` will fail with commands with these constructor parameters.
```js
// bot.js
const Discord = require('discord.js');
const { SlashCreator, GatewayServer } = require('slash-create');
const ClientCommand = require('./commands/command.js');

const client = new Discord.Client({ /* ... */ });
const creator = new SlashCreator({ /* ... */ });
creator
    .registerCommand(new ClientCommand(client, creator))
    // ...
```
```js
// commands/command.js
const { SlashCommand } = require('slash-create');

module.exports = class HelloCommand extends SlashCommand {
    constructor(client, creator, opts) {
        super(creator, opts);
        this.client = client;
    }

    // now you can use this.client ...
}
```

#### Requiring the client itself
```js
// bot.js
const Discord = require('discord.js');
const { SlashCreator, GatewayServer } = require('slash-create');

const client = new Discord.Client({ /* ... */ });
// ...

module.exports = client;
```
```js
// commands/command.js
const { SlashCommand, CommandOptionType } = require('slash-create');
const client = require('../bot.js');

module.exports = class HelloCommand extends SlashCommand {
  // ...
  async run(ctx) {
    // do stuff with the client...
  }
}
```

### My bot sent a message but it's still thinking.
Make sure that you have updated `slash-create` to the latest version. There is a pretty good chance you are **creating the message outside of the interaction**, which does not show that the interaction has been completed. (by editing the deferred message or using `ctx.send`)

**Please make sure to use `ctx.send` or return a message (string or MessageOptions) when finishing your command interaction. Any `.send` functions outside of `ctx` will not finish the interaction.**
