import {
  ApplicationCommand,
  ApplicationCommandType,
  CommandAutocompleteRequestData,
  CommandOptionType,
  ComponentType,
  InteractionRequestData,
  InteractionType,
  MessageComponentRequestData
} from '../../src/constants';
import { SlashCreator } from '../../src/creator';
import { RespondFunction } from '../../src/server';
import { MessageData } from '../../src/structures/message';

export const MOCK_TOKEN =
  '3d89bb7572e0fb30d8128367b3b1b44fecd1726de135cbe28a41f8b2f777c372ba2939e72279b94526ff5d1bd4358d65cf11';

export const noop: RespondFunction = async () => {};

export const creator = new SlashCreator({
  applicationID: '1',
  publicKey: 'abc',
  token: '0'
});

export const creatorNoToken = new SlashCreator({
  applicationID: '1',
  publicKey: 'abc'
});

export const user = {
  id: '0',
  username: 'Clyde',
  discriminator: '0000',
  avatar: null,
  public_flags: 0
};

export const userAvatar = {
  ...user,
  avatar: 'avy'
};

export const userAnimatedAvatar = {
  ...user,
  avatar: 'a_vy'
};

export const followUpMessage: MessageData = {
  id: '1234',
  type: 0,
  content: 'test',
  channel_id: '0',
  author: {
    ...user,
    bot: false
  },
  attachments: [],
  embeds: [],
  mentions: [],
  mention_roles: [],
  pinned: false,
  mention_everyone: false,
  tts: false,
  timestamp: new Date().toISOString(),
  edited_timestamp: null,
  flags: 0,
  webhook_id: '0'
};

export const editedMessage: MessageData = {
  ...followUpMessage,
  content: 'edited',
  edited_timestamp: new Date(Date.now() + 60 * 1000).toISOString()
};

export const interactionDefaults: InteractionRequestData = {
  version: 1,
  application_id: '00000000000000000',
  type: InteractionType.APPLICATION_COMMAND,
  token: MOCK_TOKEN,
  id: '00000000000000000',
  channel_id: '00000000000000000',
  guild_id: '00000000000000000',
  member: {
    user,
    roles: [],
    premium_since: null,
    permissions: '0',
    pending: false,
    mute: false,
    deaf: false,
    nick: null,
    joined_at: '2021-01-01T21:46:12.072Z'
  },
  data: {
    id: '0',
    name: 'command',
    type: ApplicationCommandType.CHAT_INPUT
  }
};

export const basicInteraction: InteractionRequestData = {
  ...interactionDefaults,
  data: {
    id: '0',
    name: 'basic-command',
    type: ApplicationCommandType.CHAT_INPUT
  }
};

export const basicMessageInteraction: MessageComponentRequestData = {
  version: 1,
  application_id: '00000000000000000',
  type: InteractionType.MESSAGE_COMPONENT,
  token: MOCK_TOKEN,
  id: '00000000000000000',
  channel_id: '00000000000000000',
  guild_id: '00000000000000000',
  member: {
    user,
    roles: [],
    premium_since: null,
    permissions: '0',
    pending: false,
    mute: false,
    deaf: false,
    nick: null,
    joined_at: '2021-01-01T21:46:12.072Z'
  },
  message: followUpMessage,
  data: {
    custom_id: '0',
    component_type: ComponentType.BUTTON
  }
};

export const selectMessageInteraction: MessageComponentRequestData = {
  ...basicMessageInteraction,
  data: {
    custom_id: '0',
    component_type: ComponentType.SELECT,
    values: ['1', '2']
  }
};

export const subCommandInteraction: InteractionRequestData = {
  ...interactionDefaults,
  data: {
    id: '0',
    name: 'sub-command',
    type: ApplicationCommandType.CHAT_INPUT,
    options: [
      {
        name: 'sub-command',
        type: CommandOptionType.SUB_COMMAND,
        options: []
      }
    ]
  }
};

export const subCommandGroupInteraction: InteractionRequestData = {
  ...interactionDefaults,
  data: {
    id: '0',
    name: 'sub-command-group',
    type: ApplicationCommandType.CHAT_INPUT,
    options: [
      {
        name: 'sub-command-group',
        type: CommandOptionType.SUB_COMMAND_GROUP,
        options: [
          {
            name: 'sub-command',
            type: CommandOptionType.SUB_COMMAND,
            options: []
          }
        ]
      }
    ]
  }
};

export const optionsInteraction: InteractionRequestData = {
  ...interactionDefaults,
  data: {
    id: '0',
    name: 'command-opts',
    type: ApplicationCommandType.CHAT_INPUT,
    options: [
      {
        name: 'string',
        type: CommandOptionType.STRING,
        value: 'hi'
      },
      {
        name: 'int',
        type: CommandOptionType.INTEGER,
        value: 2
      },
      {
        name: 'bool',
        type: CommandOptionType.BOOLEAN,
        value: true
      }
    ]
  }
};

export const subCommandOptionsInteraction: InteractionRequestData = {
  ...interactionDefaults,
  data: {
    id: '0',
    name: 'sub-command-opts',
    type: ApplicationCommandType.CHAT_INPUT,
    options: [
      {
        name: 'sub-command',
        type: CommandOptionType.SUB_COMMAND,
        options: [
          {
            name: 'string',
            type: CommandOptionType.STRING,
            value: 'hi'
          },
          {
            name: 'int',
            type: CommandOptionType.INTEGER,
            value: 2
          },
          {
            name: 'bool',
            type: CommandOptionType.BOOLEAN,
            value: true
          }
        ]
      }
    ]
  }
};

export const autocompleteInteraction: CommandAutocompleteRequestData = {
  ...interactionDefaults,
  type: InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE,
  data: {
    id: '0',
    name: 'sub-command-opts',
    type: ApplicationCommandType.CHAT_INPUT,
    version: '0',
    options: [
      {
        name: 'sub-command',
        type: CommandOptionType.SUB_COMMAND,
        options: [
          {
            name: 'string',
            type: CommandOptionType.STRING,
            value: 'incomplete str',
            focused: true
          }
        ]
      }
    ]
  }
};

export const basicCommands: ApplicationCommand[] = [
  {
    id: '1',
    name: 'to-update',
    description: 'old description',
    application_id: '1',
    version: '1',
    type: ApplicationCommandType.CHAT_INPUT
  },
  {
    id: '2',
    name: 'to-delete',
    description: 'description',
    application_id: '1',
    version: '1',
    type: ApplicationCommandType.CHAT_INPUT
  },
  {
    id: '3',
    name: 'to-leave-alone',
    description: 'description',
    application_id: '1',
    version: '1',
    type: ApplicationCommandType.CHAT_INPUT
  }
];
