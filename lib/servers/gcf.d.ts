import Server, { RequestHandler } from '../server';
/**
 * A server for Google Cloud Functions.
 * @see https://cloud.google.com/functions/
 */
declare class GCFServer extends Server {
    private _handler?;
    /**
     * @param moduleExports The exports for your module, must be `module.exports`
     * @param target The name of the exported function
     */
    constructor(moduleExports: any, target?: string);
    private _onRequest;
    /** @private */
    createEndpoint(path: string, handler: RequestHandler): void;
}
export default GCFServer;
