"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_AGENT = void 0;
const constants_1 = require("../constants");
const https_1 = __importDefault(require("https"));
const sequentialBucket_1 = __importDefault(require("./sequentialBucket"));
const zlib_1 = __importDefault(require("zlib"));
const DiscordHTTPError_1 = __importDefault(require("../errors/DiscordHTTPError"));
const DiscordRESTError_1 = __importDefault(require("../errors/DiscordRESTError"));
exports.USER_AGENT = `DiscordBot (https://github.com/Snazzah/slash-create, ${require('../../package.json').version})`;
/**
 * The request handler for REST requests.
 * @private
 */
class RequestHandler {
    /** @param creator The instantiating creator. */
    constructor(creator) {
        /** The base URL for all requests. */
        this.baseURL = constants_1.API_BASE_URL;
        /** The user agent for all requests. */
        this.userAgent = exports.USER_AGENT;
        /** The ratelimits per route. */
        this.ratelimits = {};
        /** Whether the handler is globally blocked. */
        this.globalBlock = false;
        /** The request queue. */
        this.readyQueue = [];
        this._creator = creator;
        this.requestTimeout = creator.options.requestTimeout;
        this.agent = creator.options.agent;
        this.latencyRef = {
            latency: 500,
            offset: creator.options.ratelimiterOffset,
            raw: new Array(10).fill(500),
            timeOffset: 0,
            timeOffsets: new Array(10).fill(0),
            lastTimeOffsetCheck: 0
        };
    }
    /** Unblocks the request handler. */
    globalUnblock() {
        this.globalBlock = false;
        while (this.readyQueue.length > 0) {
            this.readyQueue.shift()();
        }
    }
    /**
     * Make an API request
     * @param method Uppercase HTTP method
     * @param url URL of the endpoint
     * @param auth Whether to add the Authorization header and token or not
     * @param body Request payload
     */
    request(method, url, auth = true, body, _route, short = false) {
        const route = _route || this.routefy(url, method);
        const _stackHolder = { stack: '' }; // Preserve async stack
        Error.captureStackTrace(_stackHolder);
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const actualCall = (cb) => {
                const headers = {
                    'User-Agent': this.userAgent,
                    'Accept-Encoding': 'gzip,deflate',
                    'X-RateLimit-Precision': 'millisecond'
                };
                let data;
                const finalURL = url;
                try {
                    if (auth) {
                        if (!this._creator.options.token)
                            throw new Error('No token was set in the SlashCreator.');
                        headers.Authorization = this._creator.options.token;
                    }
                    if (body) {
                        if (method !== 'GET' && method !== 'DELETE') {
                            data = JSON.stringify(body);
                            headers['Content-Type'] = 'application/json';
                        }
                    }
                }
                catch (err) {
                    cb();
                    reject(err);
                    return;
                }
                const req = https_1.default.request({
                    method,
                    host: 'discord.com',
                    path: this.baseURL + finalURL,
                    headers: headers,
                    agent: this.agent
                });
                let reqError;
                req
                    .once('abort', () => {
                    cb();
                    reqError = reqError || new Error(`Request aborted by client on ${method} ${url}`);
                    reqError.req = req;
                    reject(reqError);
                })
                    .once('error', (err) => {
                    reqError = err;
                    req.abort();
                });
                let latency = Date.now();
                req.once('response', (resp) => {
                    if (this._creator.listeners('rawREST').length)
                        this._creator.emit('rawREST', {
                            method,
                            url,
                            auth,
                            body,
                            route,
                            short,
                            resp
                        });
                    latency = Date.now() - latency;
                    this.latencyRef.raw.push(latency);
                    this.latencyRef.latency =
                        this.latencyRef.latency - ~~(this.latencyRef.raw.shift() / 10) + ~~(latency / 10);
                    const headerNow = Date.parse(resp.headers['date']);
                    if (this.latencyRef.lastTimeOffsetCheck < Date.now() - 5000) {
                        const timeOffset = headerNow + 500 - (this.latencyRef.lastTimeOffsetCheck = Date.now());
                        if (this.latencyRef.timeOffset - this.latencyRef.latency >=
                            this._creator.options.latencyThreshold &&
                            timeOffset - this.latencyRef.latency >= this._creator.options.latencyThreshold) {
                            this._creator.emit('warn', new Error(`Your clock is ${this.latencyRef.timeOffset}ms behind Discord's server clock. Please check your connection and system time.`));
                        }
                        this.latencyRef.timeOffset =
                            this.latencyRef.timeOffset -
                                ~~(this.latencyRef.timeOffsets.shift() / 10) +
                                ~~(timeOffset / 10);
                        this.latencyRef.timeOffsets.push(timeOffset);
                    }
                    resp.once('aborted', () => {
                        cb();
                        reqError = reqError || new Error(`Request aborted by server on ${method} ${url}`);
                        reqError.req = req;
                        reject(reqError);
                    });
                    let response = '';
                    let _respStream = resp;
                    if (resp.headers['content-encoding']) {
                        if (resp.headers['content-encoding'].includes('gzip')) {
                            // @ts-ignore
                            _respStream = resp.pipe(zlib_1.default.createGunzip());
                        }
                        else if (resp.headers['content-encoding'].includes('deflate')) {
                            // @ts-ignore
                            _respStream = resp.pipe(zlib_1.default.createInflate());
                        }
                    }
                    _respStream
                        .on('data', (str) => {
                        response += str;
                    })
                        .on('error', (err) => {
                        reqError = err;
                        req.abort();
                    })
                        .once('end', () => {
                        const now = Date.now();
                        if (resp.headers['x-ratelimit-limit'])
                            this.ratelimits[route].limit = +resp.headers['x-ratelimit-limit'];
                        if (method !== 'GET' &&
                            (resp.headers['x-ratelimit-remaining'] == undefined ||
                                resp.headers['x-ratelimit-limit'] == undefined) &&
                            this.ratelimits[route].limit !== 1) {
                            this._creator.emit('debug', `Missing ratelimit headers for SequentialBucket(${this.ratelimits[route].remaining}/${this.ratelimits[route].limit}) with non-default limit\n` +
                                `${resp.statusCode} ${resp.headers['content-type']}: ${method} ${route} | ${resp.headers['cf-ray']}\n` +
                                'content-type = ' +
                                '\n' +
                                'x-ratelimit-remaining = ' +
                                resp.headers['x-ratelimit-remaining'] +
                                '\n' +
                                'x-ratelimit-limit = ' +
                                resp.headers['x-ratelimit-limit'] +
                                '\n' +
                                'x-ratelimit-reset = ' +
                                resp.headers['x-ratelimit-reset'] +
                                '\n' +
                                'x-ratelimit-global = ' +
                                resp.headers['x-ratelimit-global']);
                        }
                        this.ratelimits[route].remaining =
                            resp.headers['x-ratelimit-remaining'] === undefined ? 1 : +resp.headers['x-ratelimit-remaining'] || 0;
                        let retryAfter = parseInt(resp.headers['retry-after']);
                        // Discord breaks RFC here, using milliseconds instead of seconds (╯°□°）╯︵ ┻━┻
                        // This is the unofficial Discord dev-recommended way of detecting that
                        if (retryAfter &&
                            (typeof resp.headers['via'] !== 'string' || !resp.headers['via'].includes('1.1 google'))) {
                            retryAfter *= 1000;
                            if (retryAfter >= 1000 * 1000) {
                                this._creator.emit('warn', `Excessive Retry-After interval detected (Retry-After: ${resp.headers['retry-after']} * 1000, Via: ${resp.headers['via']})`);
                            }
                        }
                        if (retryAfter >= 0) {
                            if (resp.headers['x-ratelimit-global']) {
                                this.globalBlock = true;
                                setTimeout(() => this.globalUnblock(), retryAfter || 1);
                            }
                            else {
                                this.ratelimits[route].reset = (retryAfter || 1) + now;
                            }
                        }
                        else if (resp.headers['x-ratelimit-reset']) {
                            if (~route.lastIndexOf('/reactions/:id') &&
                                +resp.headers['x-ratelimit-reset'] * 1000 - headerNow === 1000) {
                                this.ratelimits[route].reset = now + 250;
                            }
                            else {
                                this.ratelimits[route].reset = Math.max(+resp.headers['x-ratelimit-reset'] * 1000 - this.latencyRef.timeOffset, now);
                            }
                        }
                        else {
                            this.ratelimits[route].reset = now;
                        }
                        if (resp.statusCode !== 429) {
                            this._creator.emit('debug', `${body && body.content} ${now} ${route} ${resp.statusCode}: ${latency}ms (${this.latencyRef.latency}ms avg) | ${this.ratelimits[route].remaining}/${this.ratelimits[route].limit} left | Reset ${this.ratelimits[route].reset} (${this.ratelimits[route].reset - now}ms left)`);
                        }
                        if (resp.statusCode >= 300) {
                            if (resp.statusCode === 429) {
                                this._creator.emit('debug', `${resp.headers['x-ratelimit-global'] ? 'Global' : 'Unexpected'} 429 (╯°□°）╯︵ ┻━┻: ${response}\n${body && body.content} ${now} ${route} ${resp.statusCode}: ${latency}ms (${this.latencyRef.latency}ms avg) | ${this.ratelimits[route].remaining}/${this.ratelimits[route].limit} left | Reset ${this.ratelimits[route].reset} (${this.ratelimits[route].reset - now}ms left)`);
                                if (retryAfter) {
                                    setTimeout(() => {
                                        cb();
                                        this.request(method, url, auth, body, route, true).then(resolve).catch(reject);
                                    }, retryAfter);
                                    return;
                                }
                                else {
                                    cb();
                                    this.request(method, url, auth, body, route, true).then(resolve).catch(reject);
                                    return;
                                }
                            }
                            else if (resp.statusCode === 502 && ++attempts < 4) {
                                this._creator.emit('debug', 'A wild 502 appeared! Thanks CloudFlare!');
                                setTimeout(() => {
                                    this.request(method, url, auth, body, route, true).then(resolve).catch(reject);
                                }, Math.floor(Math.random() * 1900 + 100));
                                return cb();
                            }
                            cb();
                            if (response.length > 0) {
                                if (resp.headers['content-type'] === 'application/json') {
                                    try {
                                        response = JSON.parse(response);
                                    }
                                    catch (err) {
                                        reject(err);
                                        return;
                                    }
                                }
                            }
                            let { stack } = _stackHolder;
                            if (stack.startsWith('Error\n')) {
                                stack = stack.substring(6);
                            }
                            let err;
                            if (response.code) {
                                err = new DiscordRESTError_1.default(req, resp, response, stack);
                            }
                            else {
                                err = new DiscordHTTPError_1.default(req, resp, response, stack);
                            }
                            reject(err);
                            return;
                        }
                        if (response.length > 0) {
                            if (resp.headers['content-type'] === 'application/json') {
                                try {
                                    response = JSON.parse(response);
                                }
                                catch (err) {
                                    cb();
                                    reject(err);
                                    return;
                                }
                            }
                        }
                        cb();
                        resolve(response);
                    });
                });
                req.setTimeout(this.requestTimeout, () => {
                    reqError = new Error(`Request timed out (>${this.requestTimeout}ms) on ${method} ${url}`);
                    req.abort();
                });
                req.end(data);
            };
            if (this.globalBlock && auth) {
                this.readyQueue.push(() => {
                    if (!this.ratelimits[route]) {
                        this.ratelimits[route] = new sequentialBucket_1.default(1, this.latencyRef);
                    }
                    this.ratelimits[route].queue(actualCall, short);
                });
            }
            else {
                if (!this.ratelimits[route]) {
                    this.ratelimits[route] = new sequentialBucket_1.default(1, this.latencyRef);
                }
                this.ratelimits[route].queue(actualCall, short);
            }
        });
    }
    routefy(url, method) {
        let route = url
            .replace(/\/([a-z-]+)\/(?:[0-9]{17,19})/g, function (match, p) {
            return p === 'channels' || p === 'guilds' || p === 'webhooks' ? match : `/${p}/:id`;
        })
            .replace(/\/reactions\/[^/]+/g, '/reactions/:id')
            .replace(/^\/webhooks\/(\d+)\/[A-Za-z0-9-_]{64,}/, '/webhooks/$1/:token');
        if (method === 'DELETE' && route.endsWith('/messages/:id')) {
            // Delete Messsage endpoint has its own ratelimit
            route = method + route;
        }
        return route;
    }
    toString() {
        return '[RequestHandler]';
    }
}
exports.default = RequestHandler;
