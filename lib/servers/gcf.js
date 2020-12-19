"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("../server"));
/**
 * A server for Google Cloud Functions.
 * @see https://cloud.google.com/functions/
 */
class GCFServer extends server_1.default {
    /**
     * @param moduleExports The exports for your module, must be `module.exports`
     * @param target The name of the exported function
     */
    constructor(moduleExports, target = 'interactions') {
        super({ alreadyListening: true });
        moduleExports[target] = this._onRequest.bind(this);
    }
    _onRequest(req, res) {
        if (!this._handler)
            return res.status(503).send('Server has no handler.');
        if (req.method !== 'POST')
            return res.status(405).send('Server only supports POST requests.');
        this._handler({
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
        });
    }
    /** @private */
    createEndpoint(path, handler) {
        this._handler = handler;
    }
}
exports.default = GCFServer;
