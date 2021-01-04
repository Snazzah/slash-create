# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
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
- `ctx.options` are a bit more consistent with sub-commands. Check the [last heading in the documetation](#/docs/main/v1.2.0/general/context-options) for an example.
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

[Unreleased]: https://github.com/Snazzah/slash-create/compare/v1.3.0...HEAD
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
