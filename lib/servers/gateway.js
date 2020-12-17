"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("../server"));
/** A "server" for gateway connections to pipe events into. */
class GatewayServer extends server_1.default {
    /** @param eventHandler A function that is used to handle the event for gateway interactions. */
    constructor(eventHandler) {
        super({ alreadyListening: true }, false);
        this._eventHandler = eventHandler;
    }
    /** @private */
    handleInteraction(handler) {
        this._eventHandler(handler);
    }
}
exports.default = GatewayServer;
