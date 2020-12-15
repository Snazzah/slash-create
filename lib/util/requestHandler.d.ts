/// <reference types="node" />
import SlashCreator from '../creator';
import HTTPS from 'https';
import SequentialBucket from './sequentialBucket';
interface LatencyRef {
    latency: number;
    offset?: number;
    raw: number[];
    timeOffset: number;
    timeOffsets: number[];
    lastTimeOffsetCheck: number;
}
declare class RequestHandler {
    baseURL: string;
    userAgent: string;
    ratelimits: {
        [route: string]: SequentialBucket;
    };
    requestTimeout: number;
    agent?: HTTPS.Agent;
    latencyRef: LatencyRef;
    globalBlock: boolean;
    readyQueue: any[];
    private _creator;
    constructor(creator: SlashCreator);
    globalUnblock(): void;
    /**
     * Make an API request
     * @param method Uppercase HTTP method
     * @param url URL of the endpoint
     * @param auth Whether to add the Authorization header and token or not
     * @param body Request payload
     * @returns {Resolves with the returned JSON data
     */
    request(method: string, url: string, auth?: boolean, body?: any, _route?: string, short?: boolean): Promise<any>;
    routefy(url: string, method: string): string;
    toString(): string;
}
export default RequestHandler;
