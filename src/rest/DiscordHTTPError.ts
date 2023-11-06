import type { Response } from 'undici';
import type { Request } from './request';

/** An HTTP error from a request. */
export class DiscordHTTPError extends Error {
  /** The client request of the error. */
  readonly req: Request;
  /** The response from the server. */
  readonly res: Response;
  /** The response class from a {@link Server}. */
  readonly response: any;
  /** The status code from the response. */
  readonly code: number;
  /** The error stack. */
  readonly stack: string;

  /**
   * @param req A client request
   * @param res A response
   * @param stack The error stack
   */
  constructor(req: Request, res: Response, stack: string) {
    super(`${res.status} ${res.statusText || 'Unknown error'} on ${req.method} ${req.path}`);

    this.req = req;
    this.res = res;
    this.code = res.status;

    this.stack = '';
    if (stack) this.stack = this.name + ': ' + this.message + '\n' + stack;
    else Error.captureStackTrace(this, DiscordHTTPError);
  }

  get headers() {
    return this.res.headers;
  }

  get name() {
    return this.constructor.name;
  }
}
