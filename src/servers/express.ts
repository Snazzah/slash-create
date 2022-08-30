import { Server, ServerRequestHandler, ServerOptions } from '../server';
import { MultipartData } from '../util/multipartData';

let express: any;
try {
  express = require('express');
} catch {}

/**
 * A server for Express applications.
 * @see http://expressjs.com
 */
export class ExpressServer extends Server {
  private readonly app: any;

  /**
   * @param app The express application. Must have express.json installed as a middleware.
   * @param opts The server options
   */
  constructor(app?: any, opts?: ServerOptions) {
    super(opts);
    if (!app) {
      if (!express) throw new Error('You must have the `express` package installed before using this server.');
      app = express();
      app.use(express.json());
    }
    this.app = app;
  }

  /**
   * Adds middleware to the Express server.
   * @param middleware The middleware to add.
   */
  addMiddleware(middleware: any) {
    this.app.use(middleware);
    return this;
  }

  /** Alias for {@link ExpressServer#addMiddleware} */
  use(middleware: any) {
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
  createEndpoint(path: string, handler: ServerRequestHandler) {
    this.app.post(path, (req: any, res: any) =>
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
          if (response.files) {
            const data = new MultipartData();
            res.set('Content-Type', 'multipart/form-data; boundary=' + data.boundary);
            for (const i in response.files) data.attach(`files[${i}]`, response.files[i].file, response.files[i].name);
            data.attach('payload_json', JSON.stringify(response.body));
            res.send(Buffer.concat(data.finish()));
          } else res.send(response.body);
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
