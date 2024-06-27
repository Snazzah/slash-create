import { Server, ServerRequestHandler } from '../server';

/**
 * A server for Cloudflare Workers.
 * @see https://developers.cloudflare.com/workers/
 */
export class CloudflareWorkerServer extends Server {
  private _handler?: ServerRequestHandler;

  constructor() {
    super({ alreadyListening: true });
  }

  /**
   * The fetch handler for the server. Either export the server as default or use this function in your fetch handler to utilize this server.
   * @example
   * export const workerServer = new CloudflareWorkerServer();
   * creator.withServer(workerServer);
   * export default workerServer;
   */
  readonly fetch = async (request: any, env: any, ctx: any) => {
    if (!this._handler) return new Response('Server has no handler.', { status: 503 });
    if (request.method !== 'POST') return new Response('Server only supports POST requests.', { status: 405 });
    const body = await request.text();
    return new Promise((resolve, reject) => {
      ctx.waitUntil(
        this._handler!(
          {
            headers: Object.fromEntries(request.headers.entries()),
            body: body ? JSON.parse(body) : body,
            request,
            response: null,
            rawBody: body
          },
          async (response) => {
            if (response.files) {
              const data = new FormData();
              for (const file of response.files) data.append(file.name, file.file, file.name);
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
          },
          { cloudflare: true, ...env }
        ).catch(reject)
      );
    }) as Promise<any>;
  };

  /** @private */
  createEndpoint(path: string, handler: ServerRequestHandler) {
    this._handler = handler;
  }
}
