"use strict";
/* eslint-disable @typescript-eslint/no-unused-vars */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The base Server for {@link SlashCreator}.
 * @private
 */
class Server {
    /**
     * @param opts The server options
     * @param isWebserver Whether this server is a webserver
     */
    constructor(opts = { alreadyListening: false }, isWebserver = true) {
        if (this.constructor.name === 'Server')
            throw new Error('The base Server cannot be instantiated.');
        this.alreadyListening = opts.alreadyListening;
        this.isWebserver = isWebserver;
    }
    /** @private */
    addMiddleware(middleware) {
        throw new Error(`${this.constructor.name} doesn't have a addMiddleware method.`);
    }
    /** @private */
    createEndpoint(path, handler) {
        throw new Error(`${this.constructor.name} doesn't have a createEndpoint method.`);
    }
    /** @private */
    handleInteraction(handler) {
        throw new Error(`${this.constructor.name} doesn't have a handleInteraction method.`);
    }
    /** @private */
    async listen(port = 8030, host = 'localhost') {
        throw new Error(`${this.constructor.name} doesn't have a listen method. You should remove \`.startServer()\`.`);
    }
}
exports.default = Server;
