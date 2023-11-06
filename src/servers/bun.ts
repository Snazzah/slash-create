import { Server, ServerRequestHandler } from '../server';

/**
 * A server for the Bun runtime.
 * @see https://bun.sh/docs/api/http#bun-serve
 */
export class BunServer extends Server {
  private _handler?: ServerRequestHandler;
  private _options: any = {};

  /**
   * @param options The options to use when creating a Bun server
   */
  constructor(options?: any) {
    super();
    if (!('Bun' in globalThis)) throw new Error('This can only be used in a Bun runtime.');
    this._options = options;
  }

  /**
   * The fetch handler for the server. You can call this function to run the handler or use `listen` to create a server that uses the handler.
   * @example
   * export const workerServer = new CloudflareWorkerServer();
   * creator.withServer(workerServer);
   * export default workerServer;
   */
  readonly fetch = async (request: any) => {
    if (!this._handler) return new Response('Server has no handler.', { status: 503 });
    if (request.method !== 'POST') return new Response('Server only supports POST requests.', { status: 405 });
    const body = await request.text();
    return new Promise((resolve, reject) => {
      this._handler!(
        {
          headers: Object.fromEntries(request.headers.entries()),
          body: body ? JSON.parse(body) : body,
          request,
          response: null
        },
        async (response) => {
          if (response.files) {
            const data = new FormData();
            for (const file of response.files) data.append(file.name, new Blob([file.file]), file.name);
            data.append('payload_json', JSON.stringify(response.body));
            resolve(
              new Response(data, {
                status: response.status || 200,
                headers: (response.headers || {}) as Record<string, string>
              })
            );
          } else
            resolve(
              new Response(JSON.stringify(response.body), {
                status: response.status || 200,
                headers: {
                  ...((response.headers || {}) as Record<string, string>),
                  'content-type': 'application/json'
                }
              })
            );
        }
      ).catch(reject);
    }) as Promise<any>;
  };

  /** @private */
  createEndpoint(path: string, handler: ServerRequestHandler) {
    this._handler = handler;
  }

  /** @private */
  async listen(port = 8030, host = 'localhost') {
    if (this.alreadyListening) return;
    (globalThis as any).Bun.serve({
      ...this._options,
      port,
      hostname: host,
      fetch: this.fetch
    });
  }
}
