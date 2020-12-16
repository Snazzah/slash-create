const { Command, CommandOptionType } = require('slash-create');

module.exports = class HelloCommand extends Command {
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
  }

  async run(ctx) {
    return ctx.options.food ? `You like ${ctx.options.food}? Nice!` : `Hello, ${ctx.member.displayName}!`;
  }
}
