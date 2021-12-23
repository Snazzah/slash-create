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
### How do I edit the original message from a component context?
Use `ctx.editParent` rather than `ctx.editOriginal`.

`ctx.editOriginal` edits the first sent message by the component context, while `ctx.editParent` edits the message that has the component.

### How do I remove the component buttons after they click it?
```js
await ctx.editParent('You clicked the button!', { components: [] });
```

## External Libraries

### How can I get the client from my slash command?
Starting in version 4.5.0, slash-create allows you to pass a client object to the creator, so command can access the client object.
```js
// bot.js
const Discord = require('discord.js');
const { SlashCreator, GatewayServer } = require('slash-create');

const client = new Discord.Client({ /* ... */ });
const creator = new SlashCreator({
  client,
  /* ... */
});

creator
  .withServer(
    new GatewayServer(
      (handler) => client.ws.on('INTERACTION_CREATE', handler)
    )
  )
  .registerCommandsIn(path.join(__dirname, 'commands'))
  // ...
```
```js
// commands/command.js
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
    // this.client ...
    return 'Hello!',
  }
}
```

### MessageEmbed files don't work with this!
slash-create doesn't support `discord.js`'s MessageEmbed out of the box.
You can still use the builder as such, however any files attached to the builder will not be handled and should be included in the message options instead.
```js
// Regular embed
const embed = new Discord.MessageEmbed()
  .setTitle('Hi')
  .setColor('RANDOM')
  .setTimestamp()
  .setDescription('Hello');

ctx.send([
  embeds: [embed]
])
```
```js
// Embed with files
const embed = new Discord.MessageEmbed()
  .setTitle('Look at this image')
  .setImage('attachment://coolimage.png');

ctx.send([
  embeds: [embed],
  file: {
    name: 'coolimage.png',
    file: fs.readFileSync('coolimage.png')
  }
])
```

### My bot sent a message but it's still thinking.
Make sure that you have updated `slash-create` to the latest version. There is a pretty good chance you are **creating the message outside of the interaction**, which does not show that the interaction has been completed. (by editing the deferred message or using `ctx.send`)

**Please make sure to use `ctx.send` or return a message (string or MessageOptions) when finishing your command interaction. Any `.send` functions outside of `ctx` will not finish the interaction.**
