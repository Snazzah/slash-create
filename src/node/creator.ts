import { fetch, FormData } from 'undici';
import { Blob } from 'node:buffer';
import { extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { BaseSlashCreator, FileFilter, SlashCreatorOptions } from '../creator';
import { getFiles } from '../node/util';
import nacl from 'tweetnacl';

/** The main class for using commands and interactions. */
export class SlashCreator extends BaseSlashCreator {
  /** @param opts The options for the creator */
  constructor(opts: SlashCreatorOptions) {
    // eslint-disable-next-line constructor-super
    super(opts, { fetch, FormData, Blob });
  }

  /**
   * Registers all commands in a directory. The files must export a Command class constructor or instance.
   * @param commandsPath The path to the command directory
   * @param extensionsOrFilter An array of custom file extensions (with `.js` and `.cjs` already included) or a function that filters file names
   * @example
   * await creator.registerCommandsIn(require('path').join(__dirname, 'commands'));
   */
  async registerCommandsIn(commandPath: string, extensionsOrFilter: string[] | FileFilter = []) {
    const extensions = ['.js', '.cjs', ...(Array.isArray(extensionsOrFilter) ? extensionsOrFilter : [])];
    const files = await getFiles(commandPath);
    const filter: FileFilter =
      typeof extensionsOrFilter == 'function' ? extensionsOrFilter : (file) => extensions.includes(extname(file));
    const filteredFiles = files.filter(filter);
    const commands: any[] = [];
    for (const filePath of filteredFiles) {
      try {
        // @ts-ignore This gets replaced in the post-build
        commands.push(require(pathToFileURL(filePath)));
      } catch (e) {
        this.emit('error', new Error(`Failed to load command ${filePath}: ${e}`));
      }
    }

    return this.registerCommands(commands, true);
  }

  /**
   * Validates a payload from Discord against its signature and key.
   */
  protected async _verify(body: string, signature: string, timestamp: string): Promise<boolean> {
    try {
      return nacl.sign.detached.verify(
        Buffer.from(timestamp + body),
        Buffer.from(signature, 'hex'),
        Buffer.from(this.options.publicKey!, 'hex')
      );
    } catch {
      return false;
    }
  }
}

export const Creator = SlashCreator;
