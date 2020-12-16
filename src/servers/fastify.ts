import Server, { RequestHandler, ServerOptions } from '../server';
import * as Fastify from 'fastify';

type FastifyOpts =
  | Fastify.FastifyServerOptions<any, Fastify.FastifyLoggerInstance>
  | Fastify.FastifyHttpsOptions<any, Fastify.FastifyLoggerInstance>
  | Fastify.FastifyHttp2Options<any, Fastify.FastifyLoggerInstance>
  | Fastify.FastifyHttp2SecureOptions<any, Fastify.FastifyLoggerInstance>;

let fastify: typeof Fastify;
try {
  fastify = require('fastify');
} catch {}

class FastifyServer extends Server {
  private app: Fastify.FastifyInstance;

  /** @param app The fastify application, or the options for initialization */
  constructor(app?: Fastify.FastifyInstance | FastifyOpts, opts?: ServerOptions) {
    super(opts);
    if (!fastify) throw new Error('You must have the `fastify` module installed before using this server.');
    if (!app) {
      app = fastify.default();
    } else if (!(Symbol('fastify.state') in app)) {
      app = fastify.default(app as FastifyOpts);
    }
    this.app = app as Fastify.FastifyInstance;
  }

  /**
   * Adds middleware to the Fastify server. This requires you to have 'middie' registered
   * to the server before using.
   * @param middleware The middleware to add.
   */
  addMiddleware(middleware: Function) {
    // @ts-ignore
    if ('use' in this.app) this.app.use(middleware);
    else
      throw new Error(
        "In order to use Express-like middleware, you must initialize the server and register the 'middie' module."
      );
    return this;
  }

  /** @see FastifyServer#addMiddleware */
  use(middleware: Function) {
    return this.addMiddleware(middleware);
  }

  createEndpoint(path: string, handler: RequestHandler) {
    this.app.post(path, (req, res) =>
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
          res.send(response.body);
        }
      )
    );
  }

  async listen(port = 80, host = 'localhost') {
    if (this.alreadyListening) return;
    await this.app.listen(port, host);
  }
}

export default FastifyServer;
