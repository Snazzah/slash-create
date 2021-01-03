import Server, { RequestHandler, ServerOptions } from '../server';
// @ts-ignore
import * as Express from 'express';

let express: typeof Express;
try {
  express = require('express');
} catch {}

/**
 * A server for Express applications.
 * @see http://expressjs.com
 */
class ExpressServer extends Server {
  private readonly app: Express.Application;

  /**
   * @param app The express application. Must have express.json installed as a middleware.
   * @param opts The server options
   */
  constructor(app?: Express.Application, opts?: ServerOptions) {
    super(opts);
    if (!app) {
      if (!express) throw new Error('You must have the `express` module installed before using this server.');
      app = ((express as unknown) as () => Express.Application)();
      app.use(express.json());
    }
    this.app = app;
  }

  /**
   * Adds middleware to the Express server.
   * @param middleware The middleware to add.
   */
  addMiddleware(middleware: Express.RequestHandler) {
    this.app.use(middleware);
    return this;
  }

  /** Alias for {@link ExpressServer#addMiddleware} */
  use(middleware: Express.RequestHandler) {
    return this.addMiddleware(middleware);
  }

  /**
   * Sets an Express setting.
   * @param setting Express setting string
   * @param value The value to set the setting to
   * @see http://expressjs.com/en/4x/api.html#app.settings.table
   */
  set(setting: string, value: any) {
    this.app.set(setting, value);
    return this;
  }

  /** @private */
  createEndpoint(path: string, handler: RequestHandler) {
    this.app.post(path, (req: Express.Request, res: Express.Response) =>
      handler(
        {
          headers: req.headers,
          body: req.body,
          request: req,
          response: res
        },
        async (response) => {
          res.status(response.status || 200);
          if (response.headers) for (const key in response.headers) res.set(key, response.headers[key]);
          res.send(response.body);
        }
      )
    );
  }

  /** @private */
  async listen(port = 8030, host = 'localhost') {
    if (this.alreadyListening) return;
    this.app.listen(port, host);
  }
}

export default ExpressServer;
