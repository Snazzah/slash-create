import { ChannelType, CommandChannel, ForumDefaultReaction, ForumTag, ThreadMetadata } from '../constants';
import { Permissions } from './permissions';

/** Represents a resolved channel object. */
export class Channel {
  /** The channel's type */
  readonly type: ChannelType;
  /** The channel's ID */
  readonly id: string;
  /** The ID of the last message sent in the channel */
  readonly lastMessageID: string | null;
  /** The channel's flags as a bitfield */
  readonly flags: number;
  /** The last pinned message was pinned */
  readonly lastPinTimestamp?: string | null;
  /** The application id associated with the channel */
  readonly applicationID?: string | null;

  /** The channel's name (Guild channels only) */
  readonly name?: string;
  /** The ID of the guild the channel is in (Guild channels only) */
  readonly guildID?: string;
  /** The channel's topic (Guild channels only) */
  readonly topic?: string | null;
  /** The amount of seconds the channel's slowmode is set to (Guild channels only) */
  readonly rateLimitPerUser?: number;
  /** The channel's position (Guild channels only) */
  readonly position?: number;
  /** The ID of the channel's parent channel (Guild channels only) */
  readonly parentID?: string | null;
  /** Whether the channel is marked as NSFW (Guild channels only) */
  readonly nsfw?: boolean;

  /** The voice channel's RTC region if set (Voice channels only) */
  readonly rtcRegion?: string | null;
  /** The voice channel's bitrate (Voice channels only) */
  readonly bitrate?: number;
  /** The voice channel's user limit (Voice channels only) */
  readonly userLimit?: number;

  /** The thread metadata (Threads only) */
  readonly threadMetadata?: ThreadMetadata;
  /** The amount of messages ever sent in the thread, not decrementing from deleted messages (Threads only) */
  readonly totalMessageSent?: number;
  /** The amount of messages in the thread, excluding the original message and deleted messages (Threads only)  */
  readonly messageCount?: number;
  /** The approximate count of users in a thread (Threads only) */
  readonly memberCount?: number;

  /** The default rate limit per user for posts (Forum channels only) */
  readonly defaultThreadRateLimitPerUser?: number;
  /** The default sort order of posts (Forum channels only) */
  readonly defaultSortOrder?: number | null;
  /** The default reaction emoji for posts */
  readonly defaultReactionEmoji?: ForumDefaultReaction | null;
  /** The default layout of posts (Forum channels only) */
  readonly defaultForumLayout?: number;
  /** The default auto archive duration of posts (Forum channels only) */
  readonly defaultAutoArchiveDuration?: number;
  /** The available tags that can be used in posts (Forum channels only) */
  readonly availableTags?: ForumTag[];
  /** The applied tags of the thread (Threads inside forums only) */
  readonly appliedTags?: string[];

  private _permissionsBitfield?: Permissions;
  private _permissions?: string;
  private _appPermissionsBitfield?: Permissions;
  private _appPermissions?: string;

  /**
   * @param data The data for the member
   * @param userData The data for the member's user
   * @param creator The instantiating creator
   */
  constructor(data: CommandChannel) {
    this.id = data.id;
    this.type = data.type;
    this.lastMessageID = data.last_message_id || null;
    this.flags = data.flags || 0;
    this.lastPinTimestamp = data.last_pin_timestamp;
    this.applicationID = data.application_id;

    this.name = data.name;
    this.topic = data.topic;
    this.rateLimitPerUser = data.rate_limit_per_user;
    this.position = data.position;
    this.parentID = data.parent_id;
    this.nsfw = data.nsfw;
    this.guildID = data.guild_id;
    this._permissions = data.permissions;
    this._appPermissions = data.app_permissions;

    this.rtcRegion = data.rtc_region;
    this.bitrate = data.bitrate;
    this.userLimit = data.user_limit;

    this.threadMetadata = data.thread_metadata;
    this.totalMessageSent = data.total_message_sent;
    this.messageCount = data.message_count;
    this.memberCount = data.member_count;

    this.defaultThreadRateLimitPerUser = data.default_thread_rate_limit_per_user;
    this.defaultSortOrder = data.default_sort_order;
    this.defaultReactionEmoji = data.default_reaction_emoji;
    this.defaultForumLayout = data.default_forum_layout;
    this.defaultAutoArchiveDuration = data.default_auto_archive_duration;
    this.availableTags = data.available_tags;
    this.appliedTags = data.applied_tags;
  }

  /** The string that mentions this channel. */
  get mention() {
    return `<#${this.id}>`;
  }

  /** The computed permissions for the invoking user in the channel, including overwrites, excluding implicit permissions. */
  get permissions() {
    if (!this._permissions) return null;
    if (!this._permissionsBitfield) this._permissionsBitfield = new Permissions(BigInt(this._permissions));
    return this._permissionsBitfield;
  }

  /** The computed permissions for the bot user in the channel, including overwrites, only included when part of the `resolved` data received on an interaction */
  get appPermissions() {
    if (!this._appPermissions) return null;
    if (!this._appPermissionsBitfield) this._appPermissionsBitfield = new Permissions(BigInt(this._appPermissions));
    return this._appPermissionsBitfield;
  }

  /** @hidden */
  toString() {
    return `[Channel ${this.id}]`;
  }
}
