import { SlashCommand, SlashCommandOptions } from '../../src/command';
import { CommandContext } from '../../src/structures/interfaces/commandContext';
import { SlashCreator } from '../../src/node/creator';

export const createBasicCommand = (
  opts: Partial<SlashCommandOptions> = {},
  ids: [string, string][] = [],
  cb: (ctx: CommandContext) => any = () => {}
) => {
  return class BasicCommand extends SlashCommand {
    constructor(creator: SlashCreator) {
      super(creator, {
        name: 'command',
        description: 'description',
        ...opts
      });

      this.ids = new Map(ids);
    }

    run(ctx: CommandContext) {
      return cb(ctx);
    }
  };
};
