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

module.exports = class ExclusivityCommand extends SlashCommand {
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
module.exports = class SubcommandsCommand extends SlashCommand {
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
        this.filePath = __filename;
    }
    async run(ctx) {
        // returns the subcommand, option, and option value
        let returnStringValues = [ctx.subcommands[0]];
        switch (ctx.subcommands[0]) { // Which subcommand was used?
            case 'one':
                switch (Object.keys(ctx.options[ctx.subcommands[0]])[0]) { // Which options was used?
                    case 'option_one':
                        returnStringValues.push('option_one')
                        returnStringValues.push(ctx.options[ctx.subcommands[0]]['option_one']); // value of option
                        break;
                    //...
                }
                break;
            case 'two':
                switch (Object.keys(ctx.options[ctx.subcommands[0]])[0]) {
                    case 'option_two':
                        returnStringValues.push('option_two');
                        returnStringValues.push(ctx.options[ctx.subcommands[0]]['option_two']);
                        break;
                    //...
                }
                break;
        }
        return `Subcommand: \`${returnStringValues[0]}\`\nOption: \`${returnStringValues[1]}\`\nValue of option: \`${returnStringValues[2]}\``;
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

### Command using Modals
```js
const { SlashCommand, CommandOptionType, ComponentType, TextInputStyle } = require('slash-create');

module.exports = class ModalCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'modal',
      description: 'Send a cool modal.'
    });

    this.filePath = __filename;
  }

  async run(ctx) {
    // You can send a modal this way
    // Keep in mind providing a callback is optional, but no callback requires the custom_id to be defined.
    ctx.sendModal(
      {
        title: 'Example Modal',
        components: [
          {
            type: ComponentType.ACTION_ROW,
            components: [
              {
                type: ComponentType.TEXT_INPUT,
                label: 'Text Input',
                style: TextInputStyle.SHORT,
                custom_id: 'text_input',
                placeholder: 'Type something...'
              }
            ]
          },
          {
            type: ComponentType.ACTION_ROW,
            components: [
              {
                type: ComponentType.TEXT_INPUT,
                label: 'Long Text Input',
                style: TextInputStyle.PARAGRAPH,
                custom_id: 'long_text_input',
                placeholder: 'Type something...'
              }
            ]
          }
        ]
      },
      (mctx) => {
        mctx.send(`Your input: ${mctx.values.text_input}\nYour long input: ${mctx.values.long_text_input}`);
      }
    );
  }
}
```

### Localized Command
Check [here](https://discord.com/developers/docs/reference#locales) for supported locale codes, this example uses German.
```js
const { SlashCommand, CommandOptionType } = require('slash-create');

module.exports = class HelloCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'hello',
      nameLocalizations: {
        de: 'hallo'
      },

      description: 'Says hello to you.',
      descriptionLocalizations: {
        de: 'Sagt hallo zu dir.
      },

      // It's important to note that since option localization is passed straight to Discord, the prop names are snake cased.
      options: [{
        type: CommandOptionType.STRING,

        name: 'food',
        name_localizations: {
          de: 'lebensmittel'
        },

        description: 'What food do you like?',
        description_localizations: {
          de: 'Welches Essen magst du?'
        }
      }]
    });

    this.filePath = __filename;
  }

  // If you use any package like i18next and need to asyncronously set localization, this function is ran right before syncing the command.
  async onLocaleUpdate() {
    // this.nameLocalizations['da'] = i18next.getFixedT('da')('command.hello.name');
    // this.ddescriptionLocalizationse['da'] = i18next.getFixedT('da')('command.hello.description');
  }

  async run(ctx) {
    // ctx.locale
    // ctx.guildLocale

    return ctx.options.food ? `You like ${ctx.options.food}? Nice!` : `Hello, ${ctx.user.username}!`;
  }
}
```
