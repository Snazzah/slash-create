"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** An HTTP error from a request. */
class DiscordHTTPError extends Error {
    /**
     * @param req A client request
     * @param res An incoming message from the server
     * @param response Any {@link Server}s response class
     * @param stack The error stack
     */
    constructor(req, res, response, stack) {
        super();
        this.req = req;
        this.res = res;
        this.response = response;
        this.code = res.statusCode;
        let message = `${res.statusCode} ${res.statusMessage} on ${req.method} ${req.path}`;
        const errors = this.flattenErrors(response);
        if (errors.length > 0)
            message += '\n  ' + errors.join('\n  ');
        this.message = message;
        if (stack)
            this.stack = this.name + ': ' + this.message + '\n' + stack;
        else {
            // Set stack before capturing to avoid TS error
            this.stack = '';
            Error.captureStackTrace(this, DiscordHTTPError);
        }
    }
    get name() {
        return this.constructor.name;
    }
    flattenErrors(errors, keyPrefix = '') {
        let messages = [];
        for (const fieldName in errors) {
            if (!(fieldName in errors) || fieldName === 'message' || fieldName === 'code')
                continue;
            if (Array.isArray(errors[fieldName])) {
                messages = messages.concat(errors[fieldName].map((str) => `${keyPrefix + fieldName}: ${str}`));
            }
        }
        return messages;
    }
}
exports.default = DiscordHTTPError;
