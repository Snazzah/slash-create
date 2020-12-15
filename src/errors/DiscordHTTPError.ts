import { ClientRequest, IncomingMessage } from 'http';

class DiscordHTTPError extends Error {
  readonly req: ClientRequest;
  readonly res: IncomingMessage;
  readonly response: any;
  readonly code: number;
  readonly message: string;
  readonly stack: string;

  constructor(req: ClientRequest, res: IncomingMessage, response: any, stack: string) {
    super();

    this.req = req;
    this.res = res;
    this.response = response;
    this.code = res.statusCode as number;

    let message = `${res.statusCode} ${res.statusMessage} on ${req.method} ${req.path}`;
    const errors = this.flattenErrors(response);
    if (errors.length > 0) message += '\n  ' + errors.join('\n  ');
    this.message = message;

    if (stack) this.stack = this.name + ': ' + this.message + '\n' + stack;
    else {
      // Set stack before capturing to avoid TS error
      this.stack = '';
      Error.captureStackTrace(this, DiscordHTTPError);
    }
  }

  get name() {
    return this.constructor.name;
  }

  flattenErrors(errors: any, keyPrefix = '') {
    let messages: string[] = [];
    for (const fieldName in errors) {
      if (!(fieldName in errors) || fieldName === 'message' || fieldName === 'code') continue;
      if (Array.isArray(errors[fieldName])) {
        messages = messages.concat(errors[fieldName].map((str: string) => `${keyPrefix + fieldName}: ${str}`));
      }
    }
    return messages;
  }
}

export default DiscordHTTPError;
