import { BaseSlashCreator } from '../../creator';
import { Member } from '../member';
import { User } from '../user';
import { Permissions } from '../permissions';
import { AppEntitlement, ApplicationIntegrationType, AttachmentData, InteractionContextType } from '../../constants';
import { Collection } from '../../util/collection';
import { Channel } from '../channel';
import { Message } from '../message';
import { ResolvedMember } from '../resolvedMember';
import { Role } from '../role';

/** Represents a basic interaction context. */
export class BaseInteractionContext<ServerContext extends any = unknown> {
  /** The creator of the interaction request. */
  readonly creator: BaseSlashCreator;
  /** Context passed by the server */
  readonly serverContext: ServerContext;
  /** The interaction's token. */
  readonly interactionToken: string;
  /** The interaction's ID. */
  readonly interactionID: string;
  /** The channel ID that the interaction was invoked in. */
  readonly channelID: string;
  /** The guild ID that the interaction was invoked in. */
  readonly guildID?: string;
  /** The user's locale */
  readonly locale?: string;
  /** The guild's perferred locale, if invoked in a guild. */
  readonly guildLocale?: string;
  /** The member that invoked the interaction. */
  readonly member?: Member;
  /** The user that invoked the interaction. */
  readonly user: User;
  /** The channel that interaction was used in. */
  readonly channel: Channel;
  /** The time when the interaction was created. */
  readonly invokedAt: number = Date.now();
  /** The permissions the application has. */
  readonly appPermissions?: Permissions;
  /** The entitlements the invoking user has. */
  readonly entitlements: AppEntitlement[];
  /** The attachment size limit the interaction has. */
  readonly attachmentSizeLimit: number;
  /**
   * The map of owner IDs that this interaction was authorized for.
   * @see https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-authorizing-integration-owners-object
   */
  readonly authorizingIntegrationOwners?: Record<ApplicationIntegrationType, string>;
  /** The context that this interaction comes from. */
  readonly context?: InteractionContextType;

  /** The resolved users of the interaction. */
  readonly users = new Collection<string, User>();
  /** The resolved members of the interaction. */
  readonly members = new Collection<string, ResolvedMember>();
  /** The resolved roles of the interaction. */
  readonly roles = new Collection<string, Role>();
  /** The resolved channels of the interaction. */
  readonly channels = new Collection<string, Channel>();
  /** The resolved messages of the interaction. */
  readonly messages = new Collection<string, Message>();
  /** The resolved attachments of the interaction. */
  readonly attachments = new Collection<string, AttachmentData>();

  /**
   * @param creator The instantiating creator.
   * @param data The interaction data.
   * @param serverContext The context of the server.
   */
  constructor(creator: BaseSlashCreator, data: any, serverContext: ServerContext) {
    this.creator = creator;
    this.serverContext = serverContext;

    this.interactionToken = data.token;
    this.interactionID = data.id;
    this.channelID = data.channel_id;
    this.guildID = 'guild_id' in data ? data.guild_id : undefined;
    this.locale = 'locale' in data ? data.locale : undefined;
    this.guildLocale = 'guild_locale' in data ? data.guild_locale : undefined;
    this.member = 'guild_id' in data ? new Member(data.member, this.creator, data.guild_id) : undefined;
    this.user = new User('guild_id' in data ? data.member.user : data.user, this.creator);
    this.channel = new Channel(data.channel);
    this.appPermissions = data.app_permissions ? new Permissions(BigInt(data.app_permissions)) : undefined;
    this.entitlements = data.entitlements;
    this.attachmentSizeLimit = data.attachment_size_limit;
    if ('authorizing_integration_owners' in data)
      this.authorizingIntegrationOwners = data.authorizing_integration_owners;
    if ('context' in data) this.context = data.context;

    if (data.data.resolved) {
      if (data.data.resolved.users)
        Object.keys(data.data.resolved.users).forEach((id) =>
          this.users.set(id, new User(data.data.resolved!.users![id], this.creator))
        );
      if (data.data.resolved.members)
        Object.keys(data.data.resolved.members).forEach((id) =>
          this.members.set(
            id,
            new ResolvedMember(
              data.data.resolved!.members![id],
              data.data.resolved!.users![id],
              this.creator,
              this.guildID!
            )
          )
        );
      if (data.data.resolved.roles)
        Object.keys(data.data.resolved.roles).forEach((id) =>
          this.roles.set(id, new Role(data.data.resolved!.roles![id], this.creator))
        );
      if (data.data.resolved.channels)
        Object.keys(data.data.resolved.channels).forEach((id) =>
          this.channels.set(id, new Channel(data.data.resolved!.channels![id]))
        );
      if (data.data.resolved.messages)
        Object.keys(data.data.resolved.messages).forEach((id) =>
          this.messages.set(id, new Message(data.data.resolved!.messages![id], this.creator))
        );
      if (data.data.resolved.attachments)
        Object.keys(data.data.resolved.attachments).forEach((id) =>
          this.attachments.set(id, data.data.resolved!.attachments![id])
        );
    }
  }

  /** Whether the interaction has expired. Interactions last 15 minutes. */
  get expired() {
    return this.invokedAt + 1000 * 60 * 15 < Date.now();
  }
}
