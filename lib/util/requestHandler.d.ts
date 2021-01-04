/// <reference types="node" />
import SlashCreator from '../creator';
import HTTPS from 'https';
import SequentialBucket from './sequentialBucket';
export declare const USER_AGENT: string;
/** @hidden */
interface LatencyRef {
    latency: number;
    offset?: number;
    raw: number[];
    timeOffset: number;
    timeOffsets: number[];
    lastTimeOffsetCheck: number;
}
/**
 * The request handler for REST requests.
 * @private
 */
declare class RequestHandler {
    /** The base URL for all requests. */
    readonly baseURL: string;
    /** The user agent for all requests. */
    readonly userAgent: string;
    /** The ratelimits per route. */
    readonly ratelimits: {
        [route: string]: SequentialBucket;
    };
    /** The amount of time a request will timeout. */
    readonly requestTimeout: number;
    /** TheHTTP agent used in the request handler. */
    readonly agent?: HTTPS.Agent;
    /** The latency reference for the handler. */
    readonly latencyRef: LatencyRef;
    /** Whether the handler is globally blocked. */
    globalBlock: boolean;
    /** The request queue. */
    readonly readyQueue: any[];
    /** The creator that initialized the handler. */
    private _creator;
    /** @param creator The instantiating creator. */
    constructor(creator: SlashCreator);
    /** Unblocks the request handler. */
    globalUnblock(): void;
    /**
     * Make an API request
     * @param method Uppercase HTTP method
     * @param url URL of the endpoint
     * @param auth Whether to add the Authorization header and token or not
     * @param body Request payload
     */
    request(method: string, url: string, auth?: boolean, body?: any, _route?: string, short?: boolean): Promise<any>;
    routefy(url: string, method: string): string;
    toString(): string;
}
export default RequestHandler;
