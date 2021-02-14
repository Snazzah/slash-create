"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("./user"));
/** Represents a resolved member object. */
class ResolvedMember {
    /**
     * @param data The data for the member
     * @param userData The data for the member's user
     * @param creator The instantiating creator
     */
    constructor(data, userData, creator) {
        this._creator = creator;
        if (data.nick)
            this.nick = data.nick;
        this.joinedAt = Date.parse(data.joined_at);
        this.roles = data.roles;
        if (data.premium_since)
            this.premiumSince = Date.parse(data.premium_since);
        this.pending = data.pending;
        this.id = userData.id;
        this.user = new user_1.default(userData, creator);
    }
    /** The string that mentions this member. */
    get mention() {
        return `<@!${this.id}>`;
    }
    /** @hidden */
    toString() {
        return `[ResolvedMember ${this.id}]`;
    }
    /** The display name for this member. */
    get displayName() {
        return this.nick || this.user.username;
    }
}
exports.default = ResolvedMember;
