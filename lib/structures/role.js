"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("./permissions"));
/** Represents a resolved role object. */
class Role {
    /**
     * @param data The data for the member
     */
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.position = data.position;
        this.color = data.color;
        this.hoist = data.hoist;
        this.managed = data.managed;
        this.mentionable = data.mentionable;
        this._permissions = data.permissions;
    }
    /** The string that mentions this role. */
    get mention() {
        return `<@&${this.id}>`;
    }
    /** The role's color in hexadecimal, with a leading hashtag */
    get colorHex() {
        return `#${this.color.toString(16).padStart(6, '0')}`;
    }
    /** The permissions the member has. */
    get permissions() {
        if (!this._permissionsBitfield)
            this._permissionsBitfield = new permissions_1.default(BigInt(this._permissions));
        return this._permissionsBitfield;
    }
    /** @hidden */
    toString() {
        return `[Role ${this.id}]`;
    }
}
exports.default = Role;
