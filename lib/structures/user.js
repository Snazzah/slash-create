"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const permissions_1 = __importDefault(require("./permissions"));
class User {
    constructor(data, creator) {
        this._creator = creator;
        this.id = data.id;
        this.username = data.username;
        this.discriminator = data.discriminator;
        this.avatar = data.avatar;
        this._flags = data.public_flags;
        this.bot = data.bot || false;
    }
    /** The public flags for the user. */
    get flags() {
        if (!this._flagsBitfield)
            this._flagsBitfield = new permissions_1.default(this._flags);
        return this._flagsBitfield;
    }
    get mention() {
        return `<@${this.id}>`;
    }
    toString() {
        return `[User ${this.id}]`;
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
exports.default = User;
