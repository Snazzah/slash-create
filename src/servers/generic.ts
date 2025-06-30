import { Server, ServerRequestHandler } from '../server';

/**
 * A generic server that uses Requests and Responses.
 */
export class GenericServer extends Server {
  private _handler?: ServerRequestHandler;

  constructor() {
    super({ alreadyListening: true });
  }

  /**
   * The endpoint handler for the server. This will return the response to send.
   * @example
   * export const server = new GenericServer();
   * creator.withServer(server);
   * return await server.endpoint(request);
   */
  readonly endpoint = async (request: Request): Promise<Response> => {
    if (!this._handler) return new Response('Server has no handler.', { status: 503 });
    if (request.method !== 'POST') return new Response('Server only supports POST requests.', { status: 405 });
    const body = await request.text();
    return new Promise((resolve, reject) => {
      this._handler!(
        {
          headers: Object.fromEntries(Object.entries(request.headers)),
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
              new Response(response.body ? JSON.stringify(response.body) : null, {
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
}
