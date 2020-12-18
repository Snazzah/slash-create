When getting options from a context, it's important to know the format of the options. This is dependent on the options that you defined in the command.

### Normal commands
For commands without any subcommands, each option should be mapped to a key with it's respective value.

```js
options: [{
  type: CommandOptionType.STRING,
  name: 'food',
  description: 'What food do you like?'
}, {
  type: CommandOptionType.STRING,
  name: 'drink',
  description: 'What drink do you want?'
}]

console.log(ctx.options)
/*
  {
    food: 'cheeseburger',
    drink: 'fanta'
  }
*/
```

### Nested commands
For commands with subcommands or subcommand groups, options go down the line of the subcommand it came from.

```js
options: [{
  type: CommandOptionType.SUBCOMMAND,
  name: 'order',
  description: 'Order some food.'
  options: [{
    type: CommandOptionType.STRING,
    name: 'food',
    description: 'What food do you want?'
  }, {
    type: CommandOptionType.STRING,
    name: 'drink',
    description: 'What drink do you want?'
  }]
}]

console.log(ctx.options)
/*
  {
    order: {
      food: 'cheeseburger',
      drink: 'fanta'
    }
  }
*/
```

### Nested commands with no options
If any nested command have optional options and the user provides nothing, an empty object will be in place.

```js
options: [{
  type: CommandOptionType.SUBCOMMAND,
  name: 'order',
  description: 'Order some food.'
  options: [{
    type: CommandOptionType.STRING,
    name: 'food',
    description: 'What food do you want?'
  }, {
    type: CommandOptionType.STRING,
    name: 'drink',
    description: 'What drink do you want?'
  }]
}]

console.log(ctx.options)
/*
  {
    order: {}
  }
*/
```
