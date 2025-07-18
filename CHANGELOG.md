# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
## [6.5.0] - 2025-07-17
### Added:
- Added `collectibles` to users
- Added `primaryGuild` to users (supporting guild tags)
- Added `colors` to roles (supporting role gradients)
- Added Azure Function V4 Server ([#636](https://github.com/Snazzah/slash-create/pull/636))
- Added a Generic server that uses Request/Response classes ([#637](https://github.com/Snazzah/slash-create/pull/637))
## [6.4.2] - 2025-06-15
### Fixed:
- Fix express apps being forced to use `express.json` in the entire app ([#633](https://github.com/Snazzah/slash-create/pull/633))
- `SlashCreator.registerCommandsIn` now uses `import()` interally.
- Added missing types for Component V2
## [6.4.1] - 2025-04-20
### Fixed:
- Fix message flags and attachments not being sent during `.editParent()`
- Fix null checking data in ratelimit handling
## [6.4.0] - 2025-04-18
### Added:
- Added `attachmentSizeLimit` to interactions
- Expose `guild` in interaction
- Components V2 ([#628](https://github.com/Snazzah/slash-create/pull/628))
### Changed:
- The `InteractionResponseFlags` enum is now `MessageFlags`, `InteractionResponseFlags` is now deprecated.
- Updated types to allow formatted `allowed_mentions` in message options
## [6.3.2] - 2025-03-29
### Fixed:
- Allow for just `components` in `MessageInteractionContext.send` and `MessageInteractionContext.sendFollowUp`
- Modal callbacks are now awaited, fixing execution in Cloudflare Workers ([#631](https://github.com/Snazzah/slash-create/pull/631))
- Invalid command names show the proper regex ([#629](https://github.com/Snazzah/slash-create/pull/629))
## [6.3.1] - 2024-12-18
### Added:
- Added GUILD_MEDIA channel type ([#625](https://github.com/Snazzah/slash-create/pull/625))
### Fixed:
- PING requests no longer will use the callback endpoint regardless of the `postCallbacks` option ([#626](https://github.com/Snazzah/slash-create/pull/626))
- Added a doc link to `CommandContext.options`
## [6.3.0] - 2024-09-25
### Changed:
- POST callbacks will now return responses as `InitialCallbackResponse`, multiple functions can return this instead of a boolean denoting success
### Added:
- SlashCreators using webservers can use the `postCallbacks` option to serve 202s to interactions and POST a callback instead
- Launching activities with `MessageInteractionContext#launchActivity`
- Entry points
- `SlashCommand#getMention`
- `MessageInteractionContext#defer` now supports using any message flags
- Support for editing message flags
- Support for sending polls
- [types] Updated `MessageAttachmentOptions` to support voice message properties
- Message classes now support the following:
  - call objects (`call`)
  - more thread properties (`position` and `thread`)
  - polls (`poll`)
  - `activity`
  - `applicationID`
  - message snapshots / forwarded messages (`messageSnapshots`)
  - stickers (`stickerItems`)
### Fixed:
- HTTP errors will now properly format request errors
- Fastify/Express servers should no longer respond early to some interactions
- `Message#interactionMetadata` parsing has been updated and fixed to include more data
- [types] Updated AutocompleteChoice to include `name_localizations`
- [types] Updated MessageAttachment to include `waveform`, `duration_secs`, `flags`, `title`, and `ephemeral`
- [types] Updated `Message#components` to be an array of any component rather than just action rows (See https://github.com/discord/discord-api-docs/pull/7115)
## [6.2.1] - 2024-07-21
### Fixed:
- Fixed global modal submit handlers causing errors ([#622](https://github.com/Snazzah/slash-create/pull/622))
## [6.2.0] - 2024-07-15
### Added:
- Added Server Context support for servers like Cloudflare Workers ([#621](https://github.com/Snazzah/slash-create/pull/621))
- Added premium button, deprecating `MessageInteractionContext#promptPremium` ([#618](https://github.com/Snazzah/slash-create/pull/618))
### Fixed:
- Updated permission flags and names ([#617](https://github.com/Snazzah/slash-create/pull/617))
## [6.1.4] - 2024-06-12
### Changed:
- Export node util functions `verifyKey` and `getFiles` ([#614](https://github.com/Snazzah/slash-create/pull/614))
### Fixed:
- Handle null reponses properly in DiscordRESTError
- Fix typing for ComponentButton ([#616](https://github.com/Snazzah/slash-create/pull/616))
- Updated channel permissions description ([#613](https://github.com/Snazzah/slash-create/pull/613))
## [6.1.3] - 2024-04-24
### Fixed:
- Updated `undici` to fix a [low severity CVE (CVE-2024-24758)](https://github.com/advisories/GHSA-3787-6prv-h9w3)
## [6.1.2] - 2024-04-04
### Fixed:
- Added `DANGER` ButtonStyle in accordance to Discord documentation
- Added the Request object to the `rawREST` event for `SlashCreator`
## [6.1.1] - 2024-03-30
### Fixed:
- Removed a debug log statement ([#608](https://github.com/Snazzah/slash-create/pull/608))
## [6.1.0] - 2024-03-29
### Added:
- Support for user-installable apps ([discord changelog](https://discord.com/developers/docs/change-log#march-18-2024))
  - Added `SlashCommandOptions#integrationTypes` and `SlashCommandOptions#contexts`
  - Added `BaseInteraction#authorizingIntegrationOwners` and `BaseInteraction#context`
  - `Message#interaction` deprecated in favor of `Message#interactionMetadata`
### Fixed:
- Added `applied_tags` field to channel structure ([#607](https://github.com/Snazzah/slash-create/pull/607))
- Use global name in `Member#displayName`
## [6.0.2] - 2023-12-07
### Fixed:
- Fixed some possible issues with verifying responses
## [6.0.1] - 2023-11-06
### Fixed:
- Fixed some types being exported, leading to failed builds
## [6.0.0] - 2023-11-05
### Breaking Changes:
- `SlashCreator#syncCommands` is now an asynchronous function, replacing `#syncCommandsAsync`.
- All old command permission functions have been removed.
- Command reregistering has been removed.
- The request handler has been rewritten to use `undici` using [this PR by @HeadTriXz](https://github.com/projectdysnomia/dysnomia/pull/52).
- Setting a maximum signature timestamp (`SlashCreatorOptions#maxSignatureTimestamp`) has been removed. This has caused more issues and timestamps are not checked from other implementations of slash commands.
- The minimum Node version of slash-create is now v16.
- `SlashCreator#registerCommandsIn` is now async.
- `SlashCreator#registerCommand` and `SlashCreator#registerCommands` now return the commands that have been registered.
### Additions:
- Commands can now use the `throttle()` function which takes a CommandContext and allows you to asynchronously ratelimit users before running the command itself.
- slash-create now has a web export for built-in Cloudflare Worker compatibility.
- Support for the Bun runtime with `BunServer`.
- Added the `USE_EXTERNAL_SOUNDS` permission. (1 << 46)
### Fixed:
- **types**: `min_length` and `max_length` to string options now exists
## [5.14.0] - 2023-09-27
### Added:
- Premium Subscription attributes and functions
  - **BaseInteractionContext**: Added `entitlements`
  - **MessageInteractionContext**: Added `promptPremium()`
- **types**: Added `default_value` to select menu types
## [5.13.0] - 2023-06-07
### Added:
- **User**: added support new username system ([#470](https://github.com/Snazzah/slash-create/pull/470))
### Fixed:
- **SlashCreator**: Set `syncPermissions` to false by default
## [5.12.0] - 2023-04-27
### Changed:
- **Channel**: Updated channel object to include almost all available channel properties
- **User**: Supports avatar decoration presets
- **SlashCreator**: Switch to using protected internal methods ([#419](https://github.com/Snazzah/slash-create/pull/419))
### Added:
- **Member**: Add flags property ([#460](https://github.com/Snazzah/slash-create/pull/460))
- **Permissions**: Added `MANAGE_EVENTS`, `VIEW_CREATOR_MONETIZATION_ANALYTICS`, `USE_SOUNDBOARD`, `SEND_VOICE_MESSAGES` permissions
- **BaseInteractionContext**: Added `channel` property
- **Role**: Added `tags` property
- **Member**: Added `flags` property
### Fixed:
- **SlashCreator**: Fix sync guild option being ignored
- **types**: Fixed GUILD_FORUM enum value ([#415](https://github.com/Snazzah/slash-create/pull/415))
## [5.11.0] - 2022-12-18
### Added:
- **SlashCreator**: Added global modals ([#396](https://github.com/Snazzah/slash-create/pull/396))
- **SlashCommand**: Added nsfw option
## [5.10.0] - 2022-10-17
### Changed:
- **Context**: Refactored duplicate methods into a single `BaseInteractionContext` ([#384](https://github.com/Snazzah/slash-create/issues/384))
- **Server**: Deprecated `.use` and `.addMiddleware` and made `app` member public
- **FastifyServer**: Support for v4
### Added:
- **types**: `GUILD_FORUM` and `GUILD_DIRECTORY` to `ChannelType`
- **types**: Added `USER_SELECT`, `ROLE_SELECT`, `MENTIONABLE_SELECT`, `CHANNEL_SELECT` and renamed `SELECT` to `STRING_SELECT` ([#264](https://github.com/Snazzah/slash-create/issues/264))
## [5.9.0] - 2022-09-04
### Changed:
- **RequestHandler**: Updated API version to v10
  - This shouldn't change anything when it comes to interaction-specific requests, but be mindful when making manual API requests
### Added:
- **MessageInteractionContext**: Editing attachments ([#358](https://github.com/Snazzah/slash-create/pull/358), [#361](https://github.com/Snazzah/slash-create/pull/361))
- **RequestHandler**: Added ability to send audit log reason in requests
### Fixed:
- **types**: Fixed embed types ([#357](https://github.com/Snazzah/slash-create/pull/357))
## [5.8.0] - 2022-08-17
### Added:
- **User**: Avatar Decorations
  - Note that this isn't even out yet in *canary* but as an experiment, so this may change later or just get removed in general. This change also had some fixes with it and doesn't break anything, so it's there for *whenever* it exists since it is an existing prop in user objects.
### Fixed:
- **types**: Fixed option localization types
- **SlashCreator**: Modal callbacks actually get removed after use
- **SlashCreator**: Emit `unverifiedRequest` on bad timestamps
- **MessageInteractionContext**: Options should no longer be modified when used in sending messages
## [5.7.1] - 2022-07-12
### Added:
- **types**: Add types for `min_length` and `max_length`
### Fixed:
- **MessageInteractionContext:** Reflect changes on ctx.edit from [a1e2972](https://github.com/Snazzah/slash-create/commit/a1e2972) ([#336](https://github.com/Snazzah/slash-create/pull/336))
## [5.7.0] - 2022-06-30
### Added:
- **MessageInteractionContext & AutocompleteContext:** Added `appPermissions` to all contexts.
## [5.6.1] - 2022-05-21
### Fixed:
- **Permissions:** fixed type mixing in class functions
## [5.6.0] - 2022-05-16
### Added:
- **SlashCreator:** Added `componentTimeouts` option to enable automatic component timeouts.
### Fixed:
- **MessageInteractionContext:** Component registry is no longer tied to the expiry of the interaction.
- **MessageInteractionContext:** The component expiration starts at the time of registering, rather than the time of the interaction.
## [5.5.3] - 2022-04-29
### Added:
- **SlashCommand:** Added `forcePermissions` option to be able to use default permissions while letting admins change permissions via Integrations page
## [5.5.2] - 2022-04-29
### Fixed:
- **SlashCreator:** Fix handling outdated command classes (for slash-up compatibility)
## [5.5.1] - 2022-04-28
### Fixed:
- **Permissions:** Fixed bitfield depending on class name while resolving
## [5.5.0] - 2022-04-28
### Changed:
- **[Command permissions have been deprecated](https://link.snaz.in/sc-cpd)**, including these methods/options:
  - `SyncCommandOptions#syncPermissions`
  - `SlashCreator#syncCommandPermissions`
  - `SlashCommandOptions#permissions`
  - `SlashCreatorAPI#bulkUpdateCommandPermissions`
- **SlashCommandOptions:** `#requiredPermissions` now sets member permissions within the command using `default_member_permissions`.
- **SlashCommand:** `#commandJSON` is now deprecated in favor of `#toCommandJSON`.
### Added:
- **Permissions:** New flags: `SEND_MESSAGES_IN_THREADS`, `USE_EMBEDDED_ACTIVITIES`, `MODERATE_MEMBERS`
- **ApplicationCommandPermissionType:** New type: `CHANNEL = 3`
- **SlashCommandOptions:** Added `#dmPermission`
- **SlashCreatorAPI:** Added `withLocalization` option to `#getCommands`
- **CommandContext:** Initial response attachments support
### Fixed:
- Permission names in constants being outdated
- `SlashCommandOptions#requiredPermissions` option checking
## [5.4.1] - 2022-03-30
### Fixed:
- Fixed syncing erroring for old command classes
## [5.4.0] - 2022-03-30
### Added:
- **ModalInteractionContext:** Added `#data`, `#message`, and `#editParent` ([#263](https://github.com/Snazzah/slash-create/pull/263))
- **ModalInteractionContext:** Added `#acknowledge` ([#262](https://github.com/Snazzah/slash-create/pull/262))
- **SlashCommand:** Added command localization ([#270](https://github.com/Snazzah/slash-create/pull/270))
### Fixed:
- **Message:** Fixed message mentions not being parsed correctly ([#271](https://github.com/Snazzah/slash-create/issue/271))
## [5.3.0] - 2022-03-04
### Added:
- **SlashCreator:** Added `disableTimeouts` option
### Fixed:
- **SlashCreator:** Fixed deep equal checking when syncing
## [5.2.1] - 2022-02-10
### Fixed:
- Fix types for `ApplicationCommandOptionBase` ([#247](https://github.com/Snazzah/slash-create/issue/247))
## [5.2.0] - 2022-02-09
### Changed:
- `ComponentContext` and `CommandContext` now extends off of `ModalSendableContext` rather than just `MessageInteractionContext`. `ModalSendableContext` extends off of `MessageInteractionContext`.
### Added:
- **CommandContext:** Attachment options ([#217](https://github.com/Snazzah/slash-create/pull/217))
- **SlashCreator:** `rawRequest` event ([#245](https://github.com/Snazzah/slash-create/pull/245))
- Modal Interactions ([#244](https://github.com/Snazzah/slash-create/pull/244))
## [5.1.0] - 2022-02-04
### Added:
- **MessageInteractionContext:** User locale and guild locale ([#216](https://github.com/Snazzah/slash-create/pull/216))
- **SlashCreator:** Support registering custom file extensions ([#231](https://github.com/Snazzah/slash-create/pull/231))
## [5.0.3] - 2022-01-10
### Changed:
- Replaced the `@discordjs/collection` dependency with a Collection class that has some of the features
### Fixed:
- Fixed (potential) bug with parsing allowed mentions, allowing for formatted allowed mentions to be passed in the `formatAllowedMentions` util function
## [5.0.2] - 2022-01-06
### Changed:
- Reverted the `@discordjs/collection` dependency to `0.2.1` to fall into the Node v14 version requirement ([#215](https://github.com/Snazzah/slash-create/pull/215))
  - This removes the following collection functions: `reverse`, `ensure`, `at` and `keyAt`
### Added:
- **types:** Support disabled select menus ([#211](https://github.com/Snazzah/slash-create/pull/211))
## [5.0.1] - 2021-12-24
### Fixed:
- **SlashCreator:** Filter files in `registerCommandsIn`
- **SlashCreator:** Fixed command invalidation in `reregisterCommand`
## [5.0.0] - 2021-12-23
### Breaking Changes:
- **SlashCreator:** Removed `require-all` dependency and replaced `registerCommandsIn` options to only use strings
### Added:
- **SlashCreator:** Add client passthrough option
### Removed:
- **types:** Removed `RequireAllOptions` type
## [4.4.2] - 2021-12-20
### Changed:
- Minimum Node Version is now v14
### Fixed:
- **SlashCreator:** Fixed command invalidation when registering commands. This should allow for different instances of `slash-create` SlashCommand classes to work.
## [4.4.1] - 2021-12-19
### Changed:
- Replaced the `lodash.uniq` dependency
### Fixed:
- **FastifyServer:** Fixed FastifyServer not checking for servers properly in constructor
- **util:** Fix `oneLine` function
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

[Unreleased]: https://github.com/Snazzah/slash-create/compare/v6.5.0...HEAD
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
[4.4.1]: https://github.com/Snazzah/slash-create/compare/v4.4.0...v4.4.1
[4.4.2]: https://github.com/Snazzah/slash-create/compare/v4.4.1...v4.4.2
[5.0.0]: https://github.com/Snazzah/slash-create/compare/v4.4.2...v5.0.0
[5.0.1]: https://github.com/Snazzah/slash-create/compare/v5.0.0...v5.0.1
[5.0.2]: https://github.com/Snazzah/slash-create/compare/v5.0.1...v5.0.2
[5.0.3]: https://github.com/Snazzah/slash-create/compare/v5.0.2...v5.0.3
[5.1.0]: https://github.com/Snazzah/slash-create/compare/v5.0.3...v5.1.0
[5.2.0]: https://github.com/Snazzah/slash-create/compare/v5.1.0...v5.2.0
[5.2.1]: https://github.com/Snazzah/slash-create/compare/v5.2.0...v5.2.1
[5.3.0]: https://github.com/Snazzah/slash-create/compare/v5.2.1...v5.3.0
[5.4.0]: https://github.com/Snazzah/slash-create/compare/v5.3.0...v5.4.0
[5.4.1]: https://github.com/Snazzah/slash-create/compare/v5.4.0...v5.4.1
[5.5.0]: https://github.com/Snazzah/slash-create/compare/v5.4.1...v5.5.0
[5.5.1]: https://github.com/Snazzah/slash-create/compare/v5.5.0...v5.5.1
[5.5.2]: https://github.com/Snazzah/slash-create/compare/v5.5.1...v5.5.2
[5.5.3]: https://github.com/Snazzah/slash-create/compare/v5.5.2...v5.5.3
[5.6.0]: https://github.com/Snazzah/slash-create/compare/v5.5.3...v5.6.0
[5.6.1]: https://github.com/Snazzah/slash-create/compare/v5.6.0...v5.6.1
[5.7.0]: https://github.com/Snazzah/slash-create/compare/v5.6.1...v5.7.0
[5.7.1]: https://github.com/Snazzah/slash-create/compare/v5.7.0...v5.7.1
[5.8.0]: https://github.com/Snazzah/slash-create/compare/v5.7.1...v5.8.0
[5.9.0]: https://github.com/Snazzah/slash-create/compare/v5.8.0...v5.9.0
[5.10.0]: https://github.com/Snazzah/slash-create/compare/v5.9.0...v5.10.0
[5.11.0]: https://github.com/Snazzah/slash-create/compare/v5.10.0...v5.11.0
[5.12.0]: https://github.com/Snazzah/slash-create/compare/v5.11.0...v5.12.0
[5.14.0]: https://github.com/Snazzah/slash-create/compare/v5.12.0...v5.14.0
[6.0.0]: https://github.com/Snazzah/slash-create/compare/v5.14.0...v6.0.0
[6.0.1]: https://github.com/Snazzah/slash-create/compare/v6.0.0...v6.0.1
[6.0.2]: https://github.com/Snazzah/slash-create/compare/v6.0.1...v6.0.2
[6.1.0]: https://github.com/Snazzah/slash-create/compare/v6.0.2...v6.1.0
[6.1.1]: https://github.com/Snazzah/slash-create/compare/v6.1.0...v6.1.1
[6.1.2]: https://github.com/Snazzah/slash-create/compare/v6.1.1...v6.1.2
[6.1.3]: https://github.com/Snazzah/slash-create/compare/v6.1.2...v6.1.3
[6.1.4]: https://github.com/Snazzah/slash-create/compare/v6.1.3...v6.1.4
[6.2.0]: https://github.com/Snazzah/slash-create/compare/v6.1.4...v6.2.0
[6.2.1]: https://github.com/Snazzah/slash-create/compare/v6.2.0...v6.2.1
[6.3.0]: https://github.com/Snazzah/slash-create/compare/v6.2.1...v6.3.0
[6.3.1]: https://github.com/Snazzah/slash-create/compare/v6.3.0...v6.3.1
[6.3.2]: https://github.com/Snazzah/slash-create/compare/v6.3.1...v6.3.2
[6.4.0]: https://github.com/Snazzah/slash-create/compare/v6.3.2...v6.4.0
[6.4.1]: https://github.com/Snazzah/slash-create/compare/v6.4.0...v6.4.1
[6.4.2]: https://github.com/Snazzah/slash-create/compare/v6.4.1...v6.4.2
[6.5.0]: https://github.com/Snazzah/slash-create/compare/v6.4.2...v6.5.0
