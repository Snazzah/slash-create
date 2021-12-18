# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
## [4.4.0] - 2021-12-06
### Added:
- **ResolvedMember:** Added guild-specific avatar properties and methods ([#185](https://github.com/Snazzah/slash-create/pull/185))
- **MessageInteractionContext:** Added wildcard components specification to get all component events from one message ([#188](https://github.com/Snazzah/slash-create/pull/188))
- **SlashCreator:** Add syncCommandsAsync
### Fixed:
- **ComponentContext:** Fixed allowing editing of just components
## [4.3.1] - 2021-11-14
### Added:
- **types:** Added `min_value` and `max_value` types to integer/number options ([#175](https://github.com/Snazzah/slash-create/pull/175))
## [4.3.0] - 2021-10-09
### Added:
- **ApplicationCommandOption:** Add channel type restriction option variant ([#143](https://github.com/Snazzah/slash-create/pull/143))
- **Role:** Added role icon ([#147](https://github.com/Snazzah/slash-create/pull/147))
- **SlashCreator:** Added global components ([#145](https://github.com/Snazzah/slash-create/pull/145))
- **MessageInteractionContext:** Added custom timeout and on expiry functions ([#145](https://github.com/Snazzah/slash-create/pull/145))
### Fixed:
- **types:** Add `application_id` to request data ([#146](https://github.com/Snazzah/slash-create/pull/146))
- **docs:** Fixed some typos ([#153](https://github.com/Snazzah/slash-create/pull/153))
## [4.2.0] - 2021-09-24
### Added:
- Autocomplete function to commands ([#134](https://github.com/Snazzah/slash-create/pull/134))
### Fixed:
- Reloading commands clears require cache
## [4.1.1] - 2021-09-13
### Fixed:
- Fixed Vercel Endpoint
## [4.1.0] - 2021-09-13
### Added:
- Support for Vercel ([#121](https://github.com/Snazzah/slash-create/pull/121))
### Fixed:
- Channel mentions ([#120](https://github.com/Snazzah/slash-create/pull/120))
## [4.0.1] - 2021-08-17
### Fixed:
- Fixed exports from last release
## [4.0.0] - 2021-08-16
### Removed:
- **ApplicationCommandOption:** removed deprecated `default` option
  - Reorder the required options instead.
- **Permissions:** removed `MANAGE_EMOJIS` permission in favor of`MANAGE_EMOJIS_AND_STICKERS`
- **types:** removed `CommandOption` type
- **types:** removed `FollowUpMessageOptions` in favor of `MessageOptions`
### Changed:
- **types:** `RequestHandler` -> `ServerRequestHandler`
- **types:** `TypedEmitter` -> `TypedEventEmitter`
- **Permissions/UserFlags:** `FLAGS` constants from Permissions and UserFlags are inaccessible from the file itself. Use `Permissions.FLAGS` instead.
- **index:** Almost everything is now properly exported to index ([#96](https://github.com/Snazzah/slash-create/pull/96))
  - All files are no longer using `default` for exporting
### Fixed:
- **MessageInteractionContext:** Deleting the original message de-references the message ID from the context ([#97](https://github.com/Snazzah/slash-create/pull/97))
- **ComponentContext:** Remove partial message parsing
## [3.5.0] - 2021-08-11
### Changed:
- **Permissions:** `MANAGE_EMOJIS` is now `MANAGE_EMOJIS_AND_STICKERS`, making the former deprecated.
### Added:
- **SlashCommand:** Added multiple types support for context menu commands. ([#94](https://github.com/Snazzah/slash-create/pull/94), see [updated guide](https://slash-create.js.org/#/docs/main/v3.5.0/examples/command))
- **CommandContext:** Added support for resolved messages and targeted objects. ([#94](https://github.com/Snazzah/slash-create/pull/94), see [updated guide](https://slash-create.js.org/#/docs/main/v3.5.0/examples/command))
- **Message:** Added `pinned` property.
- **Permissions:** Added `MANAGE_THREADS`, `USE_PUBLIC_THREADS`, `USE_PRIVATE_THREADS` and `USE_EXTERNAL_STICKERS`.
### Fixed:
- **SlashCommandAPI:** The interaction callback function no longer requires a token.
## [3.4.3] - 2021-08-08
### Fixed:
- ComponentContext allows for partial messages
## [3.4.2] - 2021-08-05
### Fixed:
- `ComponentContext.message` is now a Message class rather than a partial message
## [3.4.1] - 2021-07-30
### Fixed:
- Fixed bug for node versions under v14
## [3.4.0] - 2021-07-26
### Changed:
- Component callbacks have been changed internally to support other message IDs. ([#84](https://github.com/Snazzah/slash-create/pull/84))
- Follow-up messages can now be ephemeral. ([#83](https://github.com/Snazzah/slash-create/issues/83), [10ba62d](https://github.com/Snazzah/slash-create/commit/10ba62d))
- The FollowUpMessageOptions type def is deprecated.
- [`ComponentSelectOption.description`](https://slash-create.js.org/#/docs/main/v3.4.0/class/ComponentSelectOption) is now optional ([#80](https://github.com/Snazzah/slash-create/pull/80))
### Added:
- Azure Functions Server ([#82](https://github.com/Snazzah/slash-create/pull/82))
- [`MessageInteractionContext.registerComponentFrom`](https://slash-create.js.org/#/docs/main/v3.4.0/class/MessageInteractionContext?scrollTo=registerComponentFrom) to register components from other messages. ([#84](https://github.com/Snazzah/slash-create/pull/84))
## [3.3.0] - 2021-07-02
### Added:
- Option to manually handle command interactions (`SlashCreatorOptions.handleCommandsManually`)
  - If this is enabled, all command interactions will be sent through the `commandInteraction` event.
- Support for Select Components
  - Types `ComponentSelectMenu` and `ComponentSelectOption` are exported to the index
  - `ComponentActionRow` now accepts `ComponentSelectMenu`
  - Added `SELECT` to enum `ComponentType`
  - Added `ComponentSelectMenu` as a component alternative of `AnyComponent`
  - Added `values` property to `ComponentContext`
## [3.2.3] - 2021-05-30
Hotfix for 3.2.2
## [3.2.2] - 2021-05-30
### Fixed:
- Crashing on bad 429 responses ([31f4257](https://github.com/Snazzah/slash-create/commit/31f4257))
- `syncGlobalCommands` and `syncCommandsIn` checks for changes before updateing ([fe41d87](https://github.com/Snazzah/slash-create/commit/fe41d87))
## [3.2.1] - 2021-05-27
### Fixed:
- Fixed not having numbers allowed in option names
## [3.2.0] - 2021-05-27
### Changed:
- `CommandContext` and `ComponentContext` are now under a parent class: `MessageInteractionContext`
- `InterationResponseType` -> `InteractionResponseType`
### Added:
- Support for buttons in messages, see [docs](https://slash-create.js.org/#/docs/main/v3.2.0/examples/components) ([#59](https://github.com/Snazzah/slash-create/pull/59))
- [`SlashCommand.onUnload`](https://slash-create.js.org/#/docs/main/v3.2.0/class/SlashCommand?scrollTo=onUnload)
- Types `MessageOptions`, `EditMessageOptions`, `FollowUpMessageOptions`, and `MessageFile` are exported to the index
- [`SlashCreator.cleanRegisteredComponents`](https://slash-create.js.org/#/docs/main/v3.2.0/class/SlashCreator?scrollTo=cleanRegisteredComponents)
- Support for AWS Lambda, see [docs](https://slash-create.js.org/#/docs/main/v3.2.0/examples/lambda) ([#61](https://github.com/Snazzah/slash-create/pull/61), @ytausch)
- `CommandOptionType.MENTIONABLE = 9`
- Types for message embeds and attachments
### Fixed:
- Removed ConvertedOption type
- Added peer dependency meta, which should remove the warning while installing
## [3.1.0] - 2021-04-16
### Changed:
- Removed webserver timeout.
### Added:
- `USE_APPLICATION_COMMANDS` and `REQUEST_TO_SPEAK` to the permissions bitfield.
- Slash Command Permissions ([#48](https://github.com/Snazzah/slash-create/pull/48))
  - Commands now have an `ids` Map, populated upon syncing (or with `SlashCreator#collectCommandIDs`). This pairs the IDs of guild IDs and `'global'` to the command ID from the API.
  - `SlashCommandOptions#defaultPermissions`
  - You can define permissions in `SlashCommandOptions#permissions`, [See here](https://slash-create.js.org/#/docs/main/v3.1.0/examples/command) for an example.
- Fetching messages with `CommandContext#fetch` ([9c876f4](https://github.com/Snazzah/slash-create/commit/9c876f448808120b5599e8af6d0d36f328771a81))
- `Message#interaction` and `Message#messageReference`
### Fixed:
- Typing for `SlashCreatorAPI#updateCommands`


## [3.0.1] - 2021-03-29
### Fixed:
- Updated command option validation
  - Command names and option names use the documented regex pattern
  - Choice name is now 1-32 characters
  - Choice description is now 1-100 characters
- Allow empty payloads when updating commands
- Prevent webservers from auto-handling interaction errors

## [3.0.0] - 2021-03-25
### Removed:
- **[BREAKING]** `SlashCreatorOptions#autoAcknowledgeSource` has been removed.
- **[BREAKING]** `MessageOptions#includeSource` is removed.
- **[BREAKING]** `InteractionResponseType.ACKNOWLEDGE` and `InteractionResponseType.CHANNEL_MESSAGE` has been removed
- `Util.objectKeySort` is now removed.

### Changed:
- **[BREAKING]** `CommandContext#acknowledge` -> `CommandContext#defer`
  - Deferred messages are like acknowledgements, but editable and used for processing requests.
  - `CommandContext#defer` has one argument (`ephemeral`) for if the deferred message should be ephemeral.
- Docs now refer "auto-acknowledge" to "auto-defer"
- Command option and subcommand limit has increased to 25
- `CommandContext#send` now edits a deferred message if there was a deferred message sent.
- **[BREAKING]** `InteractionResponseType.ACKNOWLEDGE_WITH_SOURCE` -> `InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE`

### Added:
- `SlashCommandOptions#deferEphemeral` - Whether auto-deferring should be an ephemeral message.
- `CommandContext#deferred` - Whether the initial response has an available deferred message.
- Ability to send attachments with `CommandContext#send`
- Added FAQ page in documentation
### Fixed:
- Documentation for ResolvedMembers
- `SlashCommand#onBlock` and `SlashCommand#onError` giving weird return types in documentation

## [2.1.2] - 2021-03-16
### Changed:
- `Util.objectKeySort` is now deprecated.
### Fixed:
- Syncing commands had a major bug, sorry. ([#36](https://github.com/Snazzah/slash-create/pull/36))

## [2.1.1] - 2021-03-06
### Changed:
- Types for most of the command options reflect on how reliable the `type` property is.
### Fixed:
- Removed checking the `type` property within options to check for subcommand array and options. Not all clients send this type and should not be reliable.

## [2.1.0] - 2021-02-19
### Changed:
- Typings for command options have the `type` prop
- `CommandOption` is deprecated
- `CommandStringOption`, `CommandIntegerOption`, `CommandBooleanOption` are in the index
### Added:
- CommandContexts now support resolved objects
  - `CommandContext#members`, `CommandContext#users`, `CommandContext#roles`, `CommandContext#channels`
  - Note: `ResolvedMember`s in `CommandContext#members` do not have `mute`, `deaf` and `permissions` properties.
### Fixed:
- Updated interaction data typings with the `type` prop

## [2.0.0] - 2021-02-11
### Changed:
- The typings for `DMInteractionRequestData` and `GuildInteractionRequestData` is in the index.
- The typing for `InteractionRequestData` is now a **type** rather than an **interface**.
- The `ping` event now has a `user` parameter.
- **[BREAKING]** `CommandContext#member` and `CommandContext#guildID` is now only given in a guild context.
- **[BREAKING]** `guildID` in command options is now `guildIDs`.
- **[BREAKING]** `SlashCommand#guildID` has been replaced with `SlashCommand#guildIDs`.
### Added:
- Support for updating commands in bulk. This is now used in syncing.
- Support for multiple guild IDs in a command class.
    - `CommandOptions#guildIDs` can either be a string or an array of strings.
- Support for direct message commands.
  - `CommandContext#user` can be used in DM and guild contexts.
### Fixed:
- Unnessesary command updating while syncing.

## [1.3.0] - 2021-01-04
### Changed:
- Permission bitfield now uses bigints
- Command syncing now uses `lodash.isEqual` to check for
- `publicKey` in creator options is now optional
- Typing changes
  - `CommandOption` in constants has split off into `CommandSubcommandOption` and `AnyCommandOption`, not allowing you to define options and a value.
  - Typings for `User`, `Member` and `Message` have been set to read-only
  - Most undocumented typings are hidden/privated
- Export changes
  - Some constant exports now exports to index: `InteractionType`, `InterationResponseType`, `InteractionResponseFlags`, `CommandOptionType`, `PartialApplicationCommand`, `ApplicationCommand`, `ApplicationCommandOption`, `ApplicationCommandOptionChoice`, `RawRequest`, `AnyRequestData`, `PingRequestData`, `InteractionRequestData`, `CommandMember`, `CommandUser`, `CommandData`, `AnyCommandOption`, `CommandOption`, `CommandSubcommandOption`, `ImageFormat`
  - `ConvertedOption` now exports to index
  - `SlashCommandOptions` now exports to index
### Added:
- Commands will automatically acknowledge after 3 seconds to avoid interaction invalidation
  - You can also set `autoAcknowledgeSource` within creator options
- Documentation for unknown commands
- `Member#pending`
### Fixed:
- SlashCreator documentation
- Option validation for unknown commands
- Typings are ignored for `express` and `fastify`

## [1.2.0] - 2020-12-19
### Changed:
- `ctx.options` are a bit more consistent with sub-commands. Check the [last heading in the documetation](https://slash-create.js.org/#/docs/main/v1.2.0/general/context-options) for an example.
### Added:
- Support for registering/unregistering commands
  - New `SlashCreator` event: `commandUnregister`
  - New `SlashCreator` event: `commandReregister`
  - `SlashCreator.reregisterCommand(command, oldCommand)`
  - `SlashCreator.unregisterCommand(command)`
  - `SlashCommand.reload()`
  - `SlashCommand.unload()`
- Unknown Commands
- [Support for Google Cloud Functions](https://slash-create.js.org/#/docs/main/v1.2.0/examples/gcf). (`GCFServer`)
### Fixed:
- Some documentation
- Command finalization
- Command throttling
- Command options validation

## [1.1.6] - 2020-12-18
### Fixed:
- Sending options as the first argument in `Context#send` & `Context#sendFollowUp`

## [1.1.5] - 2020-12-18
### Fixed:
- Sending options as the first argument in `Context#edit`

## [1.1.4] - 2020-12-17
### Changed:
- Added more validation for options
### Added:
- `CommandContext#subcommands`
### Fixed:
- Option choices validation

## [1.1.3] - 2020-12-17
### Changed:
- Errors in `SlashCreator#startServer` are no longer caught.
- The default port is now `8030`.
- Some documentation clarifying things like tokens.
### Fixed:
- Moved `typed-emitter` to dependencies, fixing typings

## [1.1.2] - 2020-12-17
### Fixed:
- Race conditions for command finalization
- Errors in `SlashCommand#onError` goes to `SlashCreator#error`

## [1.1.1] - 2020-12-17
### Changed:
- `CommandContext#options` is now a non-null object
### Fixed:
- Loading commands in a folder

## [1.1.0] - 2020-12-17
This release features mostly completed documentation and changes to the packages typings. If you are using TypeScript for this package, consider this a **breaking change**.
### Changed:
- **[SEMI-BREAKING]** Index changes
  - `Command` -> `SlashCommand`
  - `Creator` -> `SlashCreator`
  - `CommandContext` is aliased as `Context`
  - `SlashCommand` is aliased as `Command`
  - `SlashCreator` is aliased as `Creator`
  - If you are using any of the changed classes for typings, you must use its class name.
    - i.e. `{ Creator }` must be `{ SlashCreator }`
- (typings) Renamed `AllRequestData` to `AnyRequestData`
- (typings) Renamed `FastifyOpts` to `FastifyOptions`
- (typings) Renamed duplicate `LatencyRef` interface in SequentialBucket to `MinimalLatencyRef`
- (typings) Added CallbackFunction type for SequentialBucket
### Added:
- Fastify typings for `FastifyServer#createEndpoint`
### Fixed:
- Changed HTTP method in `SlashCommandAPI#updateCommand` from `PUT` to `PATCH`
- `User#flags` now actually uses `UserFlags`
- Renamed UserFlags class to the name "UserFlags"

## [1.0.0] - 2020-12-16
### Removed:
- **[BREAKING]** `Context.initialResponseDeleted`
- **[BREAKING]** `treq` parameter from `SlashCreator#ping` event -  The event no longer emits any parameters
### Changed:
- **[BREAKING]** `treq` parameter in `SlashCreator#unknownInteraction` event is now `interaction`
### Added:
- More documentation
- `Context.edit(messageID, content, options)`
- `Context.editOriginal(messageID, content, options)`
- `Context.expired` and internal handlers using this
- `Context.sendFollowUp(content, options)`
- `Message` and `User` class
- `GatewayServer` - Support for gateway events
- `SlashCreatorAPI.interactionCallback(id, token, body)`
- `Server.isWebserver`
- `Server.handleInteraction()`
### Fixed:
- Default error messages
- Exports for Constants and CommandOptionType

## [0.2.0] - 2020-12-16
### Removed:
- **[BREAKING]** `Context.acknowledge` now returns a promise
- **[BREAKING]** Removed `returnPromise` from syncCommands
### Added:
- Errors will be thrown if a Server without its installed package is instantiated
### Fixed:
- RespondFunction is now a promise
- `Context.send` erroring
- Added/Updated debug emit lines
- ExpressServer for TypeScript

## [0.1.0] - 2020-12-15
- Initial release.

[Unreleased]: https://github.com/Snazzah/slash-create/compare/v4.4.0...HEAD
[0.1.0]: https://github.com/Snazzah/slash-create/releases/tag/v0.1.0
[0.2.0]: https://github.com/Snazzah/slash-create/compare/v0.1.0...v0.2.0
[1.0.0]: https://github.com/Snazzah/slash-create/compare/v0.2.0...v1.0.0
[1.1.0]: https://github.com/Snazzah/slash-create/compare/v1.0.0...v1.1.0
[1.1.1]: https://github.com/Snazzah/slash-create/compare/v1.0.0...v1.1.1
[1.1.2]: https://github.com/Snazzah/slash-create/compare/v1.1.1...v1.1.2
[1.1.3]: https://github.com/Snazzah/slash-create/compare/v1.1.2...v1.1.3
[1.1.4]: https://github.com/Snazzah/slash-create/compare/v1.1.3...v1.1.4
[1.1.5]: https://github.com/Snazzah/slash-create/compare/v1.1.4...v1.1.5
[1.1.6]: https://github.com/Snazzah/slash-create/compare/v1.1.5...v1.1.6
[1.2.0]: https://github.com/Snazzah/slash-create/compare/v1.1.6...v1.2.0
[1.3.0]: https://github.com/Snazzah/slash-create/compare/v1.2.0...v1.3.0
[2.0.0]: https://github.com/Snazzah/slash-create/compare/v1.3.0...v2.0.0
[2.1.0]: https://github.com/Snazzah/slash-create/compare/v2.0.0...v2.1.0
[2.1.1]: https://github.com/Snazzah/slash-create/compare/v2.1.0...v2.1.1
[2.1.2]: https://github.com/Snazzah/slash-create/compare/v2.1.1...v2.1.2
[3.0.0]: https://github.com/Snazzah/slash-create/compare/v2.1.2...v3.0.0
[3.0.1]: https://github.com/Snazzah/slash-create/compare/v3.0.0...v3.0.1
[3.1.0]: https://github.com/Snazzah/slash-create/compare/v3.0.1...v3.1.0
[3.2.0]: https://github.com/Snazzah/slash-create/compare/v3.1.0...v3.2.0
[3.2.1]: https://github.com/Snazzah/slash-create/compare/v3.2.0...v3.2.1
[3.2.2]: https://github.com/Snazzah/slash-create/compare/v3.2.1...v3.2.2
[3.2.3]: https://github.com/Snazzah/slash-create/compare/v3.2.2...v3.2.3
[3.3.0]: https://github.com/Snazzah/slash-create/compare/v3.2.3...v3.3.0
[3.4.0]: https://github.com/Snazzah/slash-create/compare/v3.3.0...v3.4.0
[3.4.1]: https://github.com/Snazzah/slash-create/compare/v3.4.0...v3.4.1
[3.4.2]: https://github.com/Snazzah/slash-create/compare/v3.4.1...v3.4.2
[3.4.3]: https://github.com/Snazzah/slash-create/compare/v3.4.2...v3.4.3
[3.5.0]: https://github.com/Snazzah/slash-create/compare/v3.4.3...v3.5.0
[4.0.0]: https://github.com/Snazzah/slash-create/compare/v3.5.0...v4.0.0
[4.0.1]: https://github.com/Snazzah/slash-create/compare/v4.0.0...v4.0.1
[4.1.0]: https://github.com/Snazzah/slash-create/compare/v4.0.1...v4.1.0
[4.1.1]: https://github.com/Snazzah/slash-create/compare/v4.1.0...v4.1.1
[4.2.0]: https://github.com/Snazzah/slash-create/compare/v4.1.1...v4.2.0
[4.3.0]: https://github.com/Snazzah/slash-create/compare/v4.2.0...v4.3.0
[4.3.1]: https://github.com/Snazzah/slash-create/compare/v4.3.0...v4.3.1
[4.4.0]: https://github.com/Snazzah/slash-create/compare/v4.3.0...v4.4.0
