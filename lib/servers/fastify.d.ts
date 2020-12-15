import Server, { RequestHandler, ServerOptions } from '../server';
import * as Fastify from 'fastify';
declare type FastifyOpts = Fastify.FastifyServerOptions<any, Fastify.FastifyLoggerInstance> | Fastify.FastifyHttpsOptions<any, Fastify.FastifyLoggerInstance> | Fastify.FastifyHttp2Options<any, Fastify.FastifyLoggerInstance> | Fastify.FastifyHttp2SecureOptions<any, Fastify.FastifyLoggerInstance>;
declare class FastifyServer extends Server {
    private app;
    /** @param app The fastify application, or the options for initialization */
    constructor(app?: Fastify.FastifyInstance | FastifyOpts, opts?: ServerOptions);
    /**
     * Adds middleware to the Fastify server. This requires you to have 'middie' registered
     * to the server before using.
     * @param middleware The middleware to add.
     */
    addMiddleware(middleware: Function): this;
    /** @see FastifyServer#addMiddleware */
    use(middleware: Function): this;
    createEndpoint(path: string, handler: RequestHandler): void;
    listen(port?: number, host?: string): Promise<void>;
}
export default FastifyServer;
