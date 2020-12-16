"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("../server"));
let express;
try {
    express = require('express');
}
catch { }
class ExpressServer extends server_1.default {
    /** @param app The express application. Must have express.json installed as a middleware. */
    constructor(app, opts) {
        super(opts);
        if (!app) {
            if (!express)
                throw new Error('You must have the `express` module installed before using this server.');
            app = express();
            app.use(express.json());
        }
        this.app = app;
    }
    /**
     * Adds middleware to the Express server.
     * @param middleware The middleware to add.
     */
    addMiddleware(middleware) {
        this.app.use(middleware);
        return this;
    }
    /** @see ExpressServer#addMiddleware */
    use(middleware) {
        return this.addMiddleware(middleware);
    }
    /**
     * Sets an Express setting.
     * @param setting Express setting string
     * @param value The value to set the setting to
     * @see http://expressjs.com/en/4x/api.html#app.settings.table
     */
    set(setting, value) {
        this.app.set(setting, value);
        return this;
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
                for (const key in response.headers)
                    res.set(key, response.headers[key]);
            res.send(response.body);
        }));
    }
    async listen(port = 80, host = 'localhost') {
        if (this.alreadyListening)
            return;
        this.app.listen(port, host);
    }
}
exports.default = ExpressServer;
