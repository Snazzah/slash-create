import { Server, ServerRequestHandler } from '../server';
// @ts-ignore
import type { Context, HttpRequest } from '@azure/functions';
import { MultipartData } from '../util/multipartData';

/**
 * A server for Azure Function integration
 * @see https://docs.microsoft.com/en-us/azure/azure-functions/
 */
export class AzureFunctionServer extends Server {
  private _handler?: ServerRequestHandler;

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
        context.res!.status = response.status || 200;
        if (response.files) {
          const data = new MultipartData();
          context.res!.header('Content-Type', 'multipart/form-data; boundary=' + data.boundary);
          for (const i in response.files) data.attach(`files[${i}]`, response.files[i].file, response.files[i].name);
          data.attach('payload_json', JSON.stringify(response.body));
          context.res!.send(Buffer.concat(data.finish()));
        } else {
          context.res!.header('Content-Type', 'application/json');
          context.res!.send(response.body);
        }
      }
    );
  }

  /** @private */
  createEndpoint(path: string, handler: ServerRequestHandler) {
    this._handler = handler;
  }
}
