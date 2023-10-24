import { Server, ServerRequestHandler, ServerOptions } from '../server';
import { MultipartData } from '../util/multipartData';

/**
 * A server for Fastify applications.
 * @see https://fastify.io
 */
export class FastifyServer extends Server {
  readonly app: any;

  /**
   * @param app The fastify application, or the options for initialization
   * @param opts The server options
   */
  constructor(app?: any, opts?: ServerOptions) {
    super(opts);
    try {
      const fastify = require('fastify');
      const symbols = require('fastify/lib/symbols');
      if (!app) {
        app = fastify.default();
      } else if (!(symbols.kState in app)) {
        app = fastify.default(app);
      }
    } catch (e) {
      throw new Error('You must have the `fastify` package installed before using this server.');
    }
    this.app = app;
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
          if (response.headers) res.headers(response.headers);
          if (response.files) {
            const data = new MultipartData();
            res.header('Content-Type', 'multipart/form-data; boundary=' + data.boundary);
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
    await this.app.listen({ port, host });
  }
}
