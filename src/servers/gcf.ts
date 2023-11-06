import { Server, ServerRequestHandler } from '../server';
// @ts-ignore
import type * as Express from 'express';
import { MultipartData } from '../util/multipartData';

/**
 * A server for Google Cloud Functions.
 * @see https://cloud.google.com/functions/
 */
export class GCFServer extends Server {
  private _handler?: ServerRequestHandler;

  /**
   * @param moduleExports The exports for your module, must be `module.exports`
   * @param target The name of the exported function
   */
  constructor(moduleExports: any, target = 'interactions') {
    super({ alreadyListening: true });
    moduleExports[target] = this._onRequest.bind(this);
  }

  private _onRequest(req: Express.Request, res: Express.Response) {
    if (!this._handler) return res.status(503).send('Server has no handler.');
    if (req.method !== 'POST') return res.status(405).send('Server only supports POST requests.');
    this._handler(
      {
        headers: req.headers,
        body: req.body,
        request: req,
        response: res
      },
      async (response) => {
        res.status(response.status || 200);
        if (response.headers) for (const key in response.headers) res.set(key, response.headers[key]);
        if (response.files) {
          const data = new MultipartData();
          res.set('Content-Type', 'multipart/form-data; boundary=' + data.boundary);
          for (const i in response.files) data.attach(`files[${i}]`, response.files[i].file, response.files[i].name);
          data.attach('payload_json', JSON.stringify(response.body));
          res.send(Buffer.concat(data.finish()));
        } else res.send(response.body);
      }
    );
  }

  /** @private */
  createEndpoint(path: string, handler: ServerRequestHandler) {
    this._handler = handler;
  }
}
