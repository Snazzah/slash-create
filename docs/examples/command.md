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
const { SlashCommand, ApplicationCommandPermissionType } = require('slash-create');

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
```

### Command with Subcommands
```js
const { SlashCommand, CommandOptionType } = require('slash-create');
module.exports = class SubCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'subcommands',
            description: 'Make a command with subcommands',
            options: [{
                type: CommandOptionType.SUB_COMMAND,
                name: 'one',
                description: 'Here is the first sub command',
                options: [{
                    name: 'option_one',
                    description: 'This is the first option',
                    type: CommandOptionType.STRING,
                    required: true
                }]
            }, {
                type: CommandOptionType.SUB_COMMAND,
                name: 'two',
                description: 'Here is the second sub command',
                options: [{
                    name: 'option_two',
                    description: 'This is the second option',
                    type: CommandOptionType.STRING,
                    required: true,
                    choices: [{
                        name: 'option_two_one',
                        value: 'This is the first value for sub-command two option one'
                    }, {
                        name: 'option_two_two',
                        value: 'This is the second value for sub-command two option two'
                    }]
                }]
            }]
        });
        // Not required initially, but required for reloading with a fresh file.
        this.filePath = __filename;
    }
    async run(ctx) {
        await ctx.defer();
        return `You used subcommand \`${ctx.subcommands[0]}\` and chose option \`${Object.keys(Object.values(ctx.options)[0])[0]}\` with value \`${Object.values(Object.values(ctx.options)[0])[0]}\``;
    }
};
```

### Context Menu Command
```js
const { SlashCommand, ApplicationCommandType } = require('slash-create');

module.exports = class AvatarCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      // You must specify a type for context menu commands, but defaults
      // to `CHAT_INPUT`, or regular slash commands.
      type: ApplicationCommandType.USER,
      name: 'Get Avatar URL',
    });

    this.filePath = __filename;
  }

  async run(ctx) {
    // The target user can be accessed from here
    // You can also use `ctx.targetMember` for member properties
    const target = ctx.targetUser;
    return `${target.username}'s Avatar: ${target.avatarURL}`;
  }
}
```
```js
const { SlashCommand, ApplicationCommandType } = require('slash-create');

module.exports = class ReverseCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      type: ApplicationCommandType.MESSAGE,
      name: 'Reverse this Message',
    });

    this.filePath = __filename;
  }

  async run(ctx) {
    // The target message can be accessed from here
    const msg = ctx.targetMessage;
    return msg.content.reverse();
  }
}
```

### Command with Autocompletable options
```js
const { SlashCommand, CommandOptionType } = require('slash-create');

module.exports = class HelloCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'hello',
      description: 'Says hello to you.',
      options: [{
        type: CommandOptionType.STRING,
        name: 'greeting',
        description: 'Enter a greeting!',
        required: true,
        autocomplete: true
      }]
    });

    // Not required initially, but required for reloading with a fresh file.
    this.filePath = __filename;
  }

  async autocomplete(ctx) {
    // You can send a list of choices with `ctx.sendResults` or by returning a list of choices.
    // Get the focused option name with `ctx.focused`.
    return [{ name: `Your text: ${ctx.options[ctx.focused]}`, value: ctx.options[ctx.focused] }];
  }

  async run(ctx) {
    return `> ${ctx.options.greeting}\nHello!`;
  }
}
```
