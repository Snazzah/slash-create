import { Server, ServerRequestHandler } from '../server';
// @ts-ignore
import { VercelRequest, VercelResponse } from '@vercel/node';

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
        res.send(response.body);
      }
    );
  };

  /** @private */
  createEndpoint(path: string, handler: ServerRequestHandler) {
    this._handler = handler;
  }
}
