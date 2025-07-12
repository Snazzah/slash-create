import { Server, ServerRequestHandler } from '../server';
// @ts-ignore
import type { Context, InvocationContext, HttpRequest, HttpResponseInit } from '@azure/functions';
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
      context.res!.status = 405;
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
      },
      context
    );
  }

  /** @private */
  createEndpoint(path: string, handler: ServerRequestHandler) {
    this._handler = handler;
  }
}

/**
 * A server for Azure Function V4 integration
 * @see https://docs.microsoft.com/en-us/azure/azure-functions/
 */
export class AzureFunctionV4Server extends Server {
  private _handler?: ServerRequestHandler;

  constructor(app: any, target = 'interactions') {
    super({ alreadyListening: true });
    app.http('interactions', {
      methods: ['POST'],
      authLevel: 'anonymous',
      route: target,
      handler: this._onRequest.bind(this)
    });
  }

  private async _onRequest(request: HttpRequest, context?: InvocationContext): Promise<HttpResponseInit> {
    if (!this._handler) return { status: 503, body: 'Server has no handler' };
    if (request.method !== 'POST') return { status: 405, body: 'Server only supports POST requests.' };
    const body = await request.text();
    return new Promise((resolve, reject) => {
      this._handler!(
        {
          headers: Object.fromEntries(request.headers.entries()),
          body: body ? JSON.parse(body) : body,
          request: request,
          response: null,
          rawBody: body
        },
        async (response) => {
          if (response.files) {
            const data = new MultipartData();
            for (const i in response.files) data.attach(`files[${i}]`, response.files[i].file, response.files[i].name);
            data.attach('payload_json', JSON.stringify(response.body));
            resolve({
              status: response.status || 200,
              headers: { 'Content-Type': `multipart/form-data; boundary=${data.boundary}` },
              body: Buffer.concat(data.finish())
            });
          } else {
            resolve({
              status: response.status || 200,
              headers: { 'Content-Type': 'application/json' },
              jsonBody: response.body
            });
          }
        },
        context
      ).catch(reject);
    }) as Promise<any>;
  }

  /** @private */
  createEndpoint(path: string, handler: ServerRequestHandler) {
    this._handler = handler;
  }
}
