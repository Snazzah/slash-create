"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("./permissions"));
const user_1 = __importDefault(require("./user"));
class Member {
    /**
     * @param data The data for the member
     * @param creator The instantiating creator
     */
    constructor(data, creator) {
        this._creator = creator;
        if (data.nick)
            this.nick = data.nick;
        this.joinedAt = Date.parse(data.joined_at);
        this.roles = data.roles;
        if (data.premium_since)
            this.premiumSince = Date.parse(data.premium_since);
        this.mute = data.mute;
        this.deaf = data.deaf;
        this.pending = data.pending;
        this._permissions = data.permissions;
        this.id = data.user.id;
        this.user = new user_1.default(data.user, creator);
    }
    /** The permissions the member has. */
    get permissions() {
        if (!this._permissionsBitfield)
            this._permissionsBitfield = new permissions_1.default(BigInt(this._permissions));
        return this._permissionsBitfield;
    }
    /** The string that mentions this member. */
    get mention() {
        return `<@!${this.id}>`;
    }
    /** @hidden */
    toString() {
        return `[Member ${this.id}]`;
    }
    /** The display name for this member. */
    get displayName() {
        return this.nick || this.user.username;
    }
}
exports.default = Member;
