Unknown commands are commands that fill in for commands that could not be found loaded in the creator. They are not stored normally like regular commands. This can be helpful if a guild has not yet cached the newest version of the global commands or you do not wish to sync commands in order to not lose configuration.

To make a command handled by unknown commands, you can set `unknown` to `true` in the command options.

Important notes about unknown commands:
- The `name`, `description`, `guildID`, `requiredPermissions` and `options` are not considered, since this can be called from any command.
- They do not use the `hasPermission` and the `onBlock` function, however the `onError` function is still used.
