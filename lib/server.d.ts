export interface ServerOptions {
    alreadyListening: boolean;
}
export interface TransformedRequest {
    headers: {
        [key: string]: string | string[] | undefined;
    };
    body: any;
    request: any;
    response: any;
}
export interface Response {
    status?: number;
    headers?: {
        [key: string]: string | string[] | undefined;
    };
    body?: any;
}
export declare type RequestHandler = (treq: TransformedRequest, respond: (response: Response) => void) => void;
declare class Server {
    alreadyListening: boolean;
    constructor(opts?: ServerOptions);
    addMiddleware(middleware: Function): void;
    createEndpoint(path: string, handler: RequestHandler): void;
    listen(port?: number, host?: string): Promise<void>;
}
export default Server;
