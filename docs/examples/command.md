### Basic Command
```js
const { SlashCommand, CommandOptionType } = require('slash-create');

module.exports = class HelloCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'hello',
      description: 'Says hello to you.',
      options: [{
        type: CommandOptionType.STRING,
        name: 'food',
        description: 'What food do you like?'
      }]
    });

    // Not required initially, but required for reloading with a fresh file.
    this.filePath = __filename;
  }

  async run(ctx) {
    return ctx.options.food ? `You like ${ctx.options.food}? Nice!` : `Hello, ${ctx.user.username}!`;
  }
}
```

### Command with Permissions
```js
const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');

module.exports = class HelloCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'exclusivity',
      description: 'Only Snazzah can use this command.',
      // Whether to enable this command for everyone by default
      defaultPermission: false,
      // Permissions are mapped by guild ID like this
      permissions: {
        '<guild_id>': [
          {
            type: ApplicationCommandPermissionType.USER,
            id: '158049329150427136',
            permission: true
          }
        ]
      }
    });

    this.filePath = __filename;
  }

  async run(ctx) {
    return 'Hi Snazzah!';
  }
}
