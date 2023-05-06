const { SlashCreator } = require('slash-create');
const path = require('path');
const creator = new SlashCreator({
  applicationID: '12345678901234567',
  publicKey: 'CLIENT_PUBLIC_KEY',
  token: 'BOT_TOKEN_HERE',
});

// Registers all of your commands in the ./commands/ directory
creator.registerCommandsIn(path.join(__dirname, 'commands'))
// This will sync commands to Discord, it must be called after commands are loaded.
await creator.syncCommands();
