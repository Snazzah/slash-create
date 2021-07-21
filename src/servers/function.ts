import Server, { RequestHandler } from '../server';
// Importing "type" ensures the import will not be transpiled to Js
// @ts-ignore
import type { Context, HttpRequest } from '@azure/functions';

/**
 * A server for Azure Function integration
 * @see https://docs.microsoft.com/en-us/azure/azure-functions/
 */
class AzureFunctionServer extends Server {
  private _handler?: RequestHandler;

  constructor(moduleExports: any, target = 'interactions') {
    super({ alreadyListening: true });
    moduleExports[target] = this._onRequest.bind(this);
  }

  private _onRequest(context: Context, req: HttpRequest) {
    if (!this._handler) {
      context.res!.status = 503;
      context.res!.send('Server has no handler');
    }
    if (req.method !== 'POST') {
      context.res!.status = 400;
      context.res!.send('Server only supports POST requests.');
    }
    this._handler!(
      {
        headers: req.headers,
        body: req.body,
        request: req,
        response: context.res
      },
      async (response) => {
        context.res!.status = response?.status ?? 200;
        // Hardcoding this, as the interaction will fail if this header isn't set
        context.res!.header('Content-type', 'application/json');
        for (const key in response?.headers) context.res!.header(key, response?.headers[key]);
        context.res!.send(response.body);
      }
    );
  }

  /** @private */
  createEndpoint(path: string, handler: RequestHandler) {
    this._handler = handler;
  }
}

export default AzureFunctionServer;
