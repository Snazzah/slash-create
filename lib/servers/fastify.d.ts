import Server, { RequestHandler, ServerOptions } from '../server';
import * as Fastify from 'fastify';
/** @hidden */
declare type FastifyOptions = Fastify.FastifyServerOptions<any, Fastify.FastifyLoggerInstance> | Fastify.FastifyHttpsOptions<any, Fastify.FastifyLoggerInstance> | Fastify.FastifyHttp2Options<any, Fastify.FastifyLoggerInstance> | Fastify.FastifyHttp2SecureOptions<any, Fastify.FastifyLoggerInstance>;
/**
 * A server for Fastify applications.
 * @see https://fastify.io
 */
declare class FastifyServer extends Server {
    private readonly app;
    /**
     * @param app The fastify application, or the options for initialization
     * @param opts The server options
     */
    constructor(app?: Fastify.FastifyInstance | FastifyOptions, opts?: ServerOptions);
    /**
     * Adds middleware to the Fastify server.
     * <warn>This requires you to have the 'middie' module registered to the server before using.</warn>
     * @param middleware The middleware to add.
     * @see https://www.fastify.io/docs/latest/Middleware/
     */
    addMiddleware(middleware: Function): this;
    /** Alias for {@link FastifyServer#addMiddleware} */
    use(middleware: Function): this;
    /** @private */
    createEndpoint(path: string, handler: RequestHandler): void;
    /** @private */
    listen(port?: number, host?: string): Promise<void>;
}
export default FastifyServer;
