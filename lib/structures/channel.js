"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("./permissions"));
/** Represents a resolved channel object. */
class Channel {
    /**
     * @param data The data for the member
     * @param userData The data for the member's user
     * @param creator The instantiating creator
     */
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this._permissions = data.permissions;
    }
    /** The string that mentions this channel. */
    get mention() {
        return `<@#${this.id}>`;
    }
    /** The permissions the member has. */
    get permissions() {
        if (!this._permissionsBitfield)
            this._permissionsBitfield = new permissions_1.default(BigInt(this._permissions));
        return this._permissionsBitfield;
    }
    /** @hidden */
    toString() {
        return `[Channel ${this.id}]`;
    }
}
exports.default = Channel;
