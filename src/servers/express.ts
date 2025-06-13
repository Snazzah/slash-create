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
  readonly app: any;

  /**
   * @param app The express application. Must have express.json installed as a middleware.
   * @param opts The server options
   */
  constructor(app?: any, opts?: ServerOptions) {
    super(opts);
    if (!app) {
      if (!express) throw new Error('You must have the `express` package installed before using this server.');
      app = express();
    }
    this.app = app;
  }

  /** @private */
  createEndpoint(path: string, handler: ServerRequestHandler) {
    this.app.post(
      path,
      express.json(),
      (req: any, res: any) =>
        void handler(
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
              for (const i in response.files)
                data.attach(`files[${i}]`, response.files[i].file, response.files[i].name);
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
