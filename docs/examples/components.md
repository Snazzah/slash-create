View the [documentation for Component Contexts](https://slash-create.js.org/#/docs/main/$$$ref/class/ComponentContext) to know what to use.

### Basic Event Usage
```js
const { SlashCreator } = require('slash-create');
const path = require('path');
const creator = new SlashCreator({
  applicationID: '12345678901234567',
  publicKey: 'CLIENT_PUBLIC_KEY',
  token: 'BOT_TOKEN_HERE',
});

// ...

creator.on('componentInteraction', async ctx => {
  /**
   * This context object is similar to command context as it will
   * still automatically acknowledge the interaction.
   *
   * You can still use `ctx.send` and `ctx.defer` however, there are
   * new functions like `ctx.acknowledge` and `ctx.editParent`.
   */

  if (ctx.customID === 'example_button') {
    await ctx.editParent('You clicked a button! This will overwrite the original message!');
    await ctx.send('You clicked a button! This will reply to the original message!');
  }

  // Note: You MUST use `ctx.send` and must not return regular send options.
})
```

### Usage in commands
```js
const { SlashCommand, ComponentType, ButtonStyle } = require('slash-create');

module.exports = class ButtonCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'button',
      description: 'Show some buttons.'
    });
  }

  async run(ctx) {
    await ctx.defer();
    await ctx.send('here is some buttons', {
      components: [{
        type: ComponentType.ACTION_ROW,
        components: [{
          type: ComponentType.BUTTON,
          style: ButtonStyle.PRIMARY,
          label: 'button',
          custom_id: 'example_button',
          emoji: {
            name: '👌'
          }
        }]
      }]
    });

    /**
     * This function handles component contexts within a command, so you
     * can use the previous context aswell.
     */
    ctx.registerComponent('example_button', async (btnCtx) => {
      await btnCtx.editParent('You clicked the button!');
    });
  }
}
```

### Select Component Example
Note: Only one Select component is allowed per action row. ([See Documentation](https://discord.com/developers/docs/interactions/message-components#select-menus))
```js
const { SlashCommand, ComponentType } = require('slash-create');

module.exports = class ButtonCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'class',
      description: 'Select a class!'
    });

    this.filePath = __filename;
  }

  async run(ctx) {
    await ctx.defer();
    await ctx.send('What class do you want?', {
      components: [{
        type: ComponentType.ACTION_ROW,
        components: [{
          type: ComponentType.SELECT,
          custom_id: 'class_select',
          placeholder: "Choose a class",
          min_values: 1,
          max_values: 3,
          options: [
              {
                  label: "Rogue",
                  value: "rogue",
                  description: "Sneak 'n stab",
                  emoji: {
                      name: "rogue",
                      id: "625891304148303894"
                  }
              },
              {
                  label: "Mage",
                  value: "mage",
                  description: "Turn 'em into a sheep",
                  emoji: {
                      "name": "mage",
                      "id": "625891304081063986"
                  }
              },
              {
                  label: "Priest",
                  value: "priest",
                  description: "You get heals when I'm done doing damage",
                  emoji: {
                      "name": "priest",
                      "id": "625891303795982337"
                  }
              }
          ]
        }]
      }]
    });

    /**
     * This function handles component contexts within a command, so you
     * can use the previous context aswell.
     */
    ctx.registerComponent('class_select', async (selectCtx) => {
      await selectCtx.editParent('You selected the following classes: ' + selectCtx.values.join(', '));
    });
  }
}
```

### Global Components

Global components allow action callbacks to be registered when the bot starts up, thus creating reproductible responses no matter how much time has passed since the message was sent.
They are quite useful for server welcome messages, for example.

```typescript
module.exports = class HelloCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'eternity',

      description: 'Says hello to you.',
      options: []
    });

    // Since this is registered globally in the constructor, it will remain the same forever.
    creator.registerGlobalComponent('hello', (interact) => {
      interact.sendFollowUp("This button will never expire!");
    })
  }


  async run(ctx: CommandContext) {
    return ctx.send("Press the button to agree to the rules", {components: [{type: ComponentType.ACTION_ROW, components: [{type: ComponentType.BUTTON,
      custom_id: 'hello',
      label: 'Accept Rules',
      style: ButtonStyle.PRIMARY,
    }]}]});

  }
}

```


### Global Modal

Global modal allow action callbacks to be registered when the bot starts up, thus creating reproductible responses no matter how much time has passed since the message was sent.
They are quite useful for server welcome messages, for example.

```typescript
module.exports = class HelloCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'aeon',

      description: 'Says hello to you.',
      options: []
    });

    // Since this is registered globally in the constructor, it will remain the same forever.
    creator.registerGlobalModal('hello', (interact) => {
      interact.sendFollowUp(`Hello ${interact.values.name}, This modal will never expire!`);
    })
  }


  async run(ctx: CommandContext) {
    return ctx.sendModal({
      title: 'Welcome',
      custom_id: 'hello',
      componenets: [{type: ComponentType.ACTION_ROW, components: [{type: ComponentType.TEXT_INPUT,
        custom_id: 'name',
        placeholder: 'What is your name?',
        label: 'Name',
        style: TextInputStyle.SHORT,
        required: true,
      }]}]
    })
  }
}

```

### Expirations and Callbacks
You can also set a custom expiration time for your components, and register a callback to be called when the component expires.
Note that such callbacks are only called when the component receives an invokation after the expiration time has elapsed, not instantly when the component expires.
```js
const { SlashCommand, ComponentType } = require('slash-create');

module.exports = class ButtonCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'class',
      description: 'Select a class!'
    });

    this.filePath = __filename;
  }

  async run(ctx) {
    await ctx.defer();
    await ctx.send('What class do you want?', {
      components: [{
        type: ComponentType.ACTION_ROW,
        components: [{
          type: ComponentType.SELECT,
          custom_id: 'class_select',
          placeholder: "Choose a class",
          min_values: 1,
          max_values: 3,
          options: [
              {
                  label: "Rogue",
                  value: "rogue",
                  description: "Sneak 'n stab",
                  emoji: {
                      name: "rogue",
                      id: "625891304148303894"
                  }
              },
              {
                  label: "Mage",
                  value: "mage",
                  description: "Turn 'em into a sheep",
                  emoji: {
                      "name": "mage",
                      "id": "625891304081063986"
                  }
              },
              {
                  label: "Priest",
                  value: "priest",
                  description: "You get heals when I'm done doing damage",
                  emoji: {
                      "name": "priest",
                      "id": "625891303795982337"
                  }
              }
          ]
        }]
      }]
    });

    /**
     * This function handles component contexts within a command, so you
     * can use the previous context aswell.
     */
    ctx.registerComponent('class_select',
      async (selectCtx) => {
        await selectCtx.editParent('You selected the following classes: ' + selectCtx.values.join(', '));
      },
      5000, // Expiration time in milliseconds.
      () => { // Callback to be called when the component expires.
        ctx.send("You cannot use that component anymore. Please run the command again.");
      }
    );
  }
}
```
