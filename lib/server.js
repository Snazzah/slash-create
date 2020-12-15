"use strict";
/* eslint-disable @typescript-eslint/no-unused-vars */
Object.defineProperty(exports, "__esModule", { value: true });
class Server {
    constructor(opts = { alreadyListening: false }) {
        if (this.constructor.name === 'Server')
            throw new Error('The base Server cannot be instantiated.');
        this.alreadyListening = opts.alreadyListening;
    }
    addMiddleware(middleware) {
        throw new Error(`${this.constructor.name} doesn't have a addMiddleware method.`);
    }
    createEndpoint(path, handler) {
        throw new Error(`${this.constructor.name} doesn't have a createEndpoint method.`);
    }
    async listen(port = 80, host = 'localhost') {
        throw new Error(`${this.constructor.name} doesn't have a listen method.`);
    }
}
exports.default = Server;
