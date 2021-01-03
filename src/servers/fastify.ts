import Server, { RequestHandler, ServerOptions } from '../server';
// @ts-ignore
import * as Fastify from 'fastify';

/** @hidden */
type FastifyOptions =
  | Fastify.FastifyServerOptions<any, Fastify.FastifyLoggerInstance>
  | Fastify.FastifyHttpsOptions<any, Fastify.FastifyLoggerInstance>
  | Fastify.FastifyHttp2Options<any, Fastify.FastifyLoggerInstance>
  | Fastify.FastifyHttp2SecureOptions<any, Fastify.FastifyLoggerInstance>;

let fastify: typeof Fastify;
try {
  fastify = require('fastify');
} catch {}

/**
 * A server for Fastify applications.
 * @see https://fastify.io
 */
class FastifyServer extends Server {
  private readonly app: Fastify.FastifyInstance;

  /**
   * @param app The fastify application, or the options for initialization
   * @param opts The server options
   */
  constructor(app?: Fastify.FastifyInstance | FastifyOptions, opts?: ServerOptions) {
    super(opts);
    if (!fastify) throw new Error('You must have the `fastify` module installed before using this server.');
    if (!app) {
      app = fastify.default();
    } else if (!(Symbol('fastify.state') in app)) {
      app = fastify.default(app as FastifyOptions);
    }
    this.app = app as Fastify.FastifyInstance;
  }

  /**
   * Adds middleware to the Fastify server.
   * <warn>This requires you to have the 'middie' module registered to the server before using.</warn>
   * @param middleware The middleware to add.
   * @see https://www.fastify.io/docs/latest/Middleware/
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

  /** Alias for {@link FastifyServer#addMiddleware} */
  use(middleware: Function) {
    return this.addMiddleware(middleware);
  }

  /** @private */
  createEndpoint(path: string, handler: RequestHandler) {
    this.app.post(path, (req: Fastify.FastifyRequest, res: Fastify.FastifyReply) =>
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

  /** @private */
  async listen(port = 8030, host = 'localhost') {
    if (this.alreadyListening) return;
    await this.app.listen(port, host);
  }
}

export default FastifyServer;
