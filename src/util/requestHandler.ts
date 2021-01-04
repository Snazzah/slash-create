import { API_BASE_URL } from '../constants';
import SlashCreator from '../creator';
import HTTPS from 'https';
import SequentialBucket from './sequentialBucket';
import Zlib from 'zlib';
import DiscordHTTPError from '../errors/DiscordHTTPError';
import DiscordRESTError from '../errors/DiscordRESTError';

export const USER_AGENT = `DiscordBot (https://github.com/Snazzah/slash-create, ${
  require('../../package.json').version
})`;

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
class RequestHandler {
  /** The base URL for all requests. */
  readonly baseURL: string = API_BASE_URL;
  /** The user agent for all requests. */
  readonly userAgent: string = USER_AGENT;
  /** The ratelimits per route. */
  readonly ratelimits: { [route: string]: SequentialBucket } = {};
  /** The amount of time a request will timeout. */
  readonly requestTimeout: number;
  /** TheHTTP agent used in the request handler. */
  readonly agent?: HTTPS.Agent;
  /** The latency reference for the handler. */
  readonly latencyRef: LatencyRef;
  /** Whether the handler is globally blocked. */
  globalBlock: boolean = false;
  /** The request queue. */
  readonly readyQueue: any[] = [];

  /** The creator that initialized the handler. */
  private _creator: SlashCreator;

  /** @param creator The instantiating creator. */
  constructor(creator: SlashCreator) {
    this._creator = creator;
    this.requestTimeout = creator.options.requestTimeout as number;
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
  request(method: string, url: string, auth = true, body?: any, _route?: string, short = false): Promise<any> {
    const route = _route || this.routefy(url, method);

    const _stackHolder: { stack: string } = { stack: '' }; // Preserve async stack
    Error.captureStackTrace(_stackHolder);

    return new Promise((resolve, reject) => {
      let attempts = 0;

      const actualCall = (cb: Function) => {
        const headers: { [key: string]: string } = {
          'User-Agent': this.userAgent,
          'Accept-Encoding': 'gzip,deflate',
          'X-RateLimit-Precision': 'millisecond'
        };
        let data;
        const finalURL = url;

        try {
          if (auth) {
            if (!this._creator.options.token) throw new Error('No token was set in the SlashCreator.');
            headers.Authorization = this._creator.options.token;
          }
          if (body) {
            if (method !== 'GET' && method !== 'DELETE') {
              data = JSON.stringify(body);
              headers['Content-Type'] = 'application/json';
            }
          }
        } catch (err) {
          cb();
          reject(err);
          return;
        }

        const req = HTTPS.request({
          method,
          host: 'discord.com',
          path: this.baseURL + finalURL,
          headers: headers,
          agent: this.agent
        });

        let reqError: any;

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
            this.latencyRef.latency - ~~((this.latencyRef.raw.shift() as number) / 10) + ~~(latency / 10);

          const headerNow = Date.parse(resp.headers['date'] as string);
          if (this.latencyRef.lastTimeOffsetCheck < Date.now() - 5000) {
            const timeOffset = headerNow + 500 - (this.latencyRef.lastTimeOffsetCheck = Date.now());
            if (
              this.latencyRef.timeOffset - this.latencyRef.latency >=
                (this._creator.options.latencyThreshold as number) &&
              timeOffset - this.latencyRef.latency >= (this._creator.options.latencyThreshold as number)
            ) {
              this._creator.emit(
                'warn',
                new Error(
                  `Your clock is ${this.latencyRef.timeOffset}ms behind Discord's server clock. Please check your connection and system time.`
                )
              );
            }
            this.latencyRef.timeOffset =
              this.latencyRef.timeOffset -
              ~~((this.latencyRef.timeOffsets.shift() as number) / 10) +
              ~~(timeOffset / 10);
            this.latencyRef.timeOffsets.push(timeOffset);
          }

          resp.once('aborted', () => {
            cb();
            reqError = reqError || new Error(`Request aborted by server on ${method} ${url}`);
            reqError.req = req;
            reject(reqError);
          });

          let response: any = '';

          let _respStream = resp;
          if (resp.headers['content-encoding']) {
            if (resp.headers['content-encoding'].includes('gzip')) {
              // @ts-ignore
              _respStream = resp.pipe(Zlib.createGunzip());
            } else if (resp.headers['content-encoding'].includes('deflate')) {
              // @ts-ignore
              _respStream = resp.pipe(Zlib.createInflate());
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

              if (resp.headers['x-ratelimit-limit']) this.ratelimits[route].limit = +resp.headers['x-ratelimit-limit'];

              if (
                method !== 'GET' &&
                (resp.headers['x-ratelimit-remaining'] == undefined ||
                  resp.headers['x-ratelimit-limit'] == undefined) &&
                this.ratelimits[route].limit !== 1
              ) {
                this._creator.emit(
                  'debug',
                  `Missing ratelimit headers for SequentialBucket(${this.ratelimits[route].remaining}/${this.ratelimits[route].limit}) with non-default limit\n` +
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
                    resp.headers['x-ratelimit-global']
                );
              }

              this.ratelimits[route].remaining =
                resp.headers['x-ratelimit-remaining'] === undefined ? 1 : +resp.headers['x-ratelimit-remaining'] || 0;

              let retryAfter = parseInt(resp.headers['retry-after'] as string);
              // Discord breaks RFC here, using milliseconds instead of seconds (╯°□°）╯︵ ┻━┻
              // This is the unofficial Discord dev-recommended way of detecting that
              if (
                retryAfter &&
                (typeof resp.headers['via'] !== 'string' || !resp.headers['via'].includes('1.1 google'))
              ) {
                retryAfter *= 1000;
                if (retryAfter >= 1000 * 1000) {
                  this._creator.emit(
                    'warn',
                    `Excessive Retry-After interval detected (Retry-After: ${resp.headers['retry-after']} * 1000, Via: ${resp.headers['via']})`
                  );
                }
              }
              if (retryAfter >= 0) {
                if (resp.headers['x-ratelimit-global']) {
                  this.globalBlock = true;
                  setTimeout(() => this.globalUnblock(), retryAfter || 1);
                } else {
                  this.ratelimits[route].reset = (retryAfter || 1) + now;
                }
              } else if (resp.headers['x-ratelimit-reset']) {
                if (
                  ~route.lastIndexOf('/reactions/:id') &&
                  +resp.headers['x-ratelimit-reset'] * 1000 - headerNow === 1000
                ) {
                  this.ratelimits[route].reset = now + 250;
                } else {
                  this.ratelimits[route].reset = Math.max(
                    +resp.headers['x-ratelimit-reset'] * 1000 - this.latencyRef.timeOffset,
                    now
                  );
                }
              } else {
                this.ratelimits[route].reset = now;
              }

              if (resp.statusCode !== 429) {
                this._creator.emit(
                  'debug',
                  `${body && body.content} ${now} ${route} ${resp.statusCode}: ${latency}ms (${
                    this.latencyRef.latency
                  }ms avg) | ${this.ratelimits[route].remaining}/${this.ratelimits[route].limit} left | Reset ${
                    this.ratelimits[route].reset
                  } (${this.ratelimits[route].reset - now}ms left)`
                );
              }

              if ((resp.statusCode as number) >= 300) {
                if (resp.statusCode === 429) {
                  this._creator.emit(
                    'debug',
                    `${resp.headers['x-ratelimit-global'] ? 'Global' : 'Unexpected'} 429 (╯°□°）╯︵ ┻━┻: ${response}\n${
                      body && body.content
                    } ${now} ${route} ${resp.statusCode}: ${latency}ms (${this.latencyRef.latency}ms avg) | ${
                      this.ratelimits[route].remaining
                    }/${this.ratelimits[route].limit} left | Reset ${this.ratelimits[route].reset} (${
                      this.ratelimits[route].reset - now
                    }ms left)`
                  );
                  if (retryAfter) {
                    setTimeout(() => {
                      cb();
                      this.request(method, url, auth, body, route, true).then(resolve).catch(reject);
                    }, retryAfter);
                    return;
                  } else {
                    cb();
                    this.request(method, url, auth, body, route, true).then(resolve).catch(reject);
                    return;
                  }
                } else if (resp.statusCode === 502 && ++attempts < 4) {
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
                    } catch (err) {
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
                  err = new DiscordRESTError(req, resp, response, stack);
                } else {
                  err = new DiscordHTTPError(req, resp, response, stack);
                }
                reject(err);
                return;
              }

              if (response.length > 0) {
                if (resp.headers['content-type'] === 'application/json') {
                  try {
                    response = JSON.parse(response);
                  } catch (err) {
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
            this.ratelimits[route] = new SequentialBucket(1, this.latencyRef);
          }
          this.ratelimits[route].queue(actualCall, short);
        });
      } else {
        if (!this.ratelimits[route]) {
          this.ratelimits[route] = new SequentialBucket(1, this.latencyRef);
        }
        this.ratelimits[route].queue(actualCall, short);
      }
    });
  }

  routefy(url: string, method: string) {
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

export default RequestHandler;
