/// <reference types="node" />
import { ClientRequest, IncomingMessage } from 'http';
declare class DiscordRESTError extends Error {
    readonly req: ClientRequest;
    readonly res: IncomingMessage;
    readonly response: any;
    readonly code: number;
    readonly message: string;
    readonly stack: string;
    constructor(req: ClientRequest, res: IncomingMessage, response: any, stack: string);
    get name(): string;
    flattenErrors(errors: any, keyPrefix?: string): string[];
}
export default DiscordRESTError;
