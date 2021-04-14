import SlashCommand, { CommandPermissions, ThrottlingOptions } from '../../src/command';
import { ApplicationCommandOption } from '../../src/constants';
import CommandContext from '../../src/context';
import SlashCreator from '../../src/creator';

interface SlashCommandPartialOptions {
  name?: string;
  description?: string;
  guildIDs?: string | string[];
  requiredPermissions?: Array<string>;
  options?: ApplicationCommandOption[];
  throttling?: ThrottlingOptions;
  unknown?: boolean;
  deferEphemeral?: boolean;
  defaultPermission?: boolean;
  permissions?: CommandPermissions;
}

export const createBasicCommand = (
  opts: SlashCommandPartialOptions = {},
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
