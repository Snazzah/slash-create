import Server, { RequestHandler } from '../server';
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
        context.res!.status = response ? response.status || 200 : 200;
        context.res!.header('Content-type', 'application/json');
        for (const key in response?.headers) context.res!.header(key, response?.headers[key]);
        context.res!.send(response!.body);
      }
    );
  }

  /** @private */
  createEndpoint(path: string, handler: RequestHandler) {
    this._handler = handler;
  }
}

export default AzureFunctionServer;
