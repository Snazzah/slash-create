import Server, { RequestHandler, ServerOptions } from '../server';
import * as Express from 'express';
/**
 * A server for Express applications.
 * @see http://expressjs.com
 */
declare class ExpressServer extends Server {
    private readonly app;
    /**
     * @param app The express application. Must have express.json installed as a middleware.
     * @param opts The server options
     */
    constructor(app?: Express.Application, opts?: ServerOptions);
    /**
     * Adds middleware to the Express server.
     * @param middleware The middleware to add.
     */
    addMiddleware(middleware: Express.RequestHandler): this;
    /** Alias for {@link ExpressServer#addMiddleware} */
    use(middleware: Express.RequestHandler): this;
    /**
     * Sets an Express setting.
     * @param setting Express setting string
     * @param value The value to set the setting to
     * @see http://expressjs.com/en/4x/api.html#app.settings.table
     */
    set(setting: string, value: any): this;
    /** @private */
    createEndpoint(path: string, handler: RequestHandler): void;
    /** @private */
    listen(port?: number, host?: string): Promise<void>;
}
export default ExpressServer;
