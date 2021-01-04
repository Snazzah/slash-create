import SlashCommand, { ThrottlingOptions } from '../../src/command';
import { ApplicationCommandOption } from '../../src/constants';
import CommandContext from '../../src/context';
import SlashCreator from '../../src/creator';

interface SlashCommandPartialOptions {
  name?: string;
  description?: string;
  guildID?: string;
  requiredPermissions?: Array<string>;
  options?: ApplicationCommandOption[];
  throttling?: ThrottlingOptions;
  unknown?: boolean;
}

export const createBasicCommand = (
  opts: SlashCommandPartialOptions = {},
  cb: (ctx: CommandContext) => any = () => {}
) => {
  return class BasicCommand extends SlashCommand {
    constructor(creator: SlashCreator) {
      super(creator, {
        name: 'command',
        description: 'description',
        ...opts
      });
    }

    run(ctx: CommandContext) {
      return cb(ctx);
    }
  };
};
