import { AllRequestData } from './constants';
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
export declare type RespondFunction = (response: Response) => Promise<void>;
export declare type RequestHandler = (treq: TransformedRequest, respond: RespondFunction) => void;
export declare type InteractionHandler = (interaction: AllRequestData) => void;
declare class Server {
    alreadyListening: boolean;
    isWebserver: boolean;
    constructor(opts?: ServerOptions, isWebserver?: boolean);
    addMiddleware(middleware: Function): void;
    createEndpoint(path: string, handler: RequestHandler): void;
    handleInteraction(handler: InteractionHandler): void;
    listen(port?: number, host?: string): Promise<void>;
}
export default Server;
