"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const permissions_1 = __importDefault(require("./permissions"));
class Member {
    constructor(data, creator) {
        this._creator = creator;
        this.nick = data.nick;
        this.joinedAt = Date.parse(data.joined_at);
        this.roles = data.roles;
        if (data.premium_since)
            this.premiumSince = Date.parse(data.premium_since);
        this.mute = data.mute;
        this.deaf = data.deaf;
        this._permissions = data.permissions;
        this.id = data.user.id;
        this.username = data.user.username;
        this.discriminator = data.user.discriminator;
        this.avatar = data.user.avatar;
        this._userFlags = data.user.public_flags;
    }
    /** The permissions the member has. */
    get permissions() {
        if (!this._permissionsBitfield)
            this._permissionsBitfield = new permissions_1.default(parseInt(this._permissions));
        return this._permissionsBitfield;
    }
    /** The public flags for the user. */
    get userFlags() {
        if (!this._userFlagsBitfield)
            this._userFlagsBitfield = new permissions_1.default(this._userFlags);
        return this._userFlagsBitfield;
    }
    get mention() {
        return `<@!${this.id}>`;
    }
    toString() {
        return `[Member ${this.id}]`;
    }
    get displayName() {
        return this.nick || this.username;
    }
    get defaultAvatar() {
        return parseInt(this.discriminator) % 5;
    }
    get defaultAvatarURL() {
        return `${constants_1.CDN_URL}${constants_1.Endpoints.DEFAULT_USER_AVATAR(this.defaultAvatar)}.png`;
    }
    get avatarURL() {
        return this.dynamicAvatarURL();
    }
    dynamicAvatarURL(format, size) {
        if (!this.avatar)
            return this.defaultAvatarURL;
        if (!format || !constants_1.ImageFormats.includes(format.toLowerCase())) {
            format = this.avatar.startsWith('a_') ? 'gif' : this._creator.options.defaultImageFormat;
        }
        if (!size || size < constants_1.ImageSizeBoundaries.MINIMUM || size > constants_1.ImageSizeBoundaries.MAXIMUM || size & (size - 1)) {
            size = this._creator.options.defaultImageSize;
        }
        return `${constants_1.CDN_URL}${constants_1.Endpoints.USER_AVATAR(this.id, this.avatar)}.${format}?size=${size}`;
    }
}
exports.default = Member;
