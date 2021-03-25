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
```js
// bot.js
const Discord = require('discord.js');
const { SlashCreator, GatewayServer } = require('slash-create');

const client = new Discord.Client(/* ... */);
// ...

module.exports = client;
```
```js
// commands/command.js
const { SlashCommand, CommandOptionType } = require('slash-create');
const client = require("../bot.js");

module.exports = class HelloCommand extends SlashCommand {
  // ...
  async run(ctx) {
    // do stuff with the client...
  }
}
```

### MessageEmbed doesn't work with this!
slash-create doesn't support `discord.js`'s MessageEmbed out of the box.
You can still use the builder if you send an embed JSON.
```js
const embed = new Discord.MessageEmbed()
  .setTitle('Hi')
  .setColor('RANDOM')
  .setTimestamp()
  .setDescription('Hello');

ctx.send([
  embeds: [embed.toJSON()]
])
```
