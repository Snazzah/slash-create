import { BaseSlashCreator, SlashCreatorOptions } from '../creator';

function hex2bin(hex: string) {
  const buf = new Uint8Array(Math.ceil(hex.length / 2));
  for (var i = 0; i < buf.length; i++) {
    buf[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return buf;
}

/**
 * The main class for using commands and interactions for web environments.
 * @hidden
 */
export class SlashCreator extends BaseSlashCreator {
  #encoder = new TextEncoder();
  #publicKey?: CryptoKey;

  constructor(opts: SlashCreatorOptions) {
    super(opts, { fetch, FormData, Blob });
  }

  async #getPublicKey() {
    if (this.#publicKey) return this.#publicKey;
    // @ts-expect-error Node.js needs to know this is a public key
    this.#publicKey = await crypto.subtle.importKey(
      'raw',
      hex2bin(this.options.publicKey!),
      { name: 'NODE-ED25519', namedCurve: 'NODE-ED25519', public: true },
      true,
      ['verify']
    );
    return this.#publicKey;
  }

  /**
   * Validates a payload from Discord against its signature and key.
   * @see https://gist.github.com/devsnek/77275f6e3f810a9545440931ed314dc1
   */
  protected async _verify(body: string, signature: string, timestamp: string): Promise<boolean> {
    return await crypto.subtle.verify(
      'NODE-ED25519',
      await this.#getPublicKey(),
      hex2bin(signature),
      this.#encoder.encode(timestamp + body)
    );
  }
}

export const Creator = SlashCreator;
