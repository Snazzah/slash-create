const { Creator } = require('slash-create');
const path = require('path');
const creator = new Creator({
  applicationID: '12345678901234567',
  publicKey: 'CLIENT_PUBLIC_KEY',
  token: 'BOT_TOKEN_HERE',
});

creator
    // Registers all of your commands in the ./commands/ directory
    .registerCommandsIn(path.join(__dirname, 'commands'))
    // This will sync commands to Discord, it must be called after commands are loaded.
    // This also returns itself for more chaining capabilities.
    .syncCommands();
