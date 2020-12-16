"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("../server"));
let fastify;
try {
    fastify = require('fastify');
}
catch { }
class FastifyServer extends server_1.default {
    /** @param app The fastify application, or the options for initialization */
    constructor(app, opts) {
        super(opts);
        if (!fastify)
            throw new Error('You must have the `fastify` module installed before using this server.');
        if (!app) {
            app = fastify.default();
        }
        else if (!(Symbol('fastify.state') in app)) {
            app = fastify.default(app);
        }
        this.app = app;
    }
    /**
     * Adds middleware to the Fastify server. This requires you to have 'middie' registered
     * to the server before using.
     * @param middleware The middleware to add.
     */
    addMiddleware(middleware) {
        // @ts-ignore
        if ('use' in this.app)
            this.app.use(middleware);
        else
            throw new Error("In order to use Express-like middleware, you must initialize the server and register the 'middie' module.");
        return this;
    }
    /** @see FastifyServer#addMiddleware */
    use(middleware) {
        return this.addMiddleware(middleware);
    }
    createEndpoint(path, handler) {
        this.app.post(path, (req, res) => handler({
            headers: req.headers,
            body: req.body,
            request: req,
            response: res
        }, async (response) => {
            res.status(response.status || 200);
            if (response.headers)
                res.headers(response.headers);
            res.send(response.body);
        }));
    }
    async listen(port = 80, host = 'localhost') {
        if (this.alreadyListening)
            return;
        await this.app.listen(port, host);
    }
}
exports.default = FastifyServer;
