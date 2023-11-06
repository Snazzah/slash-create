import { Server, ServerRequestHandler } from '../server';
// @ts-ignore
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MultipartData } from '../util/multipartData';

/**
 * A server for Vercel.
 * @see https://vercel.com/
 * @see https://vercel.com/guides/handling-node-request-body
 */
export class VercelServer extends Server {
  private _handler?: ServerRequestHandler;

  constructor() {
    super({ alreadyListening: true });
  }

  /** The endpoint Vercel uses for serverless functions. */
  vercelEndpoint = (req: VercelRequest, res: VercelResponse) => {
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
        if (response.headers) for (const key in response.headers) res.setHeader(key, response.headers[key] as string);
        if (response.files) {
          const data = new MultipartData();
          res.setHeader('Content-Type', 'multipart/form-data; boundary=' + data.boundary);
          for (const i in response.files) data.attach(`files[${i}]`, response.files[i].file, response.files[i].name);
          data.attach('payload_json', JSON.stringify(response.body));
          res.send(Buffer.concat(data.finish()));
        } else res.send(response.body);
      }
    );
  };

  /** @private */
  createEndpoint(path: string, handler: ServerRequestHandler) {
    this._handler = handler;
  }
}
