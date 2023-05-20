### Minimal Setup Example

1. Login to the [AWS Management Console](https://console.aws.amazon.com/).
2. Navigate to *Services* &rarr; *Lambda* &rarr; *Create function*
3. Set a function name, leave Node.js as runtime, click *Create function*
4. Create a local Node.js project on your computer, install this library. Create a source file (e.g. `index.js`) and use the following example code:

```js
const path = require('path');
const { AWSLambdaServer, SlashCreator } = require('slash-create');

const creator = new SlashCreator({
    applicationID: process.env.DISCORD_APP_ID,
    publicKey: process.env.DISCORD_PUBLIC_KEY,
    token: process.env.DISCORD_BOT_TOKEN
});

// The first argument is required, the second argument is the name or "target" of the export.
// It defaults to 'interactions', so it would not be strictly necessary here.
creator.withServer(new AWSLambdaServer(module.exports, 'interactions'))

await creator.registerCommandsIn(path.join(__dirname, 'commands'));

await creator.syncCommands();
```

5. Make sure to create some example commands in the *commands* directory.
6. Zip the whole project and upload it by selecting *Upload from* &rarr; *.zip file* in the AWS Lambda console. Your zipped folder structure should look like this (note that there is no root folder):

```
upload.zip
├── node_modules
│   └── ...
├── commands
│   └── exampleCommand.js
├── index.js
└── package.json (optional)
```

7. *Deploy* your code, if needed.
8. *Edit* the runtime settings, set your handler (e.g. `index.interactions`)
9. If necessary (like in the example code above), add your Discord credentials under *Configuration* &rarr; *Environment variables*
10. Navigate to *Services* &rarr; *API Gateway* &rarr; *Create API* &rarr; *HTTP API* &rarr; *Build*
11. Add a new "Lambda" integration, choose your previously created function
12. Make sure to select **Payload Format Version 2.0** and assign an arbitrary API name
13. After selecting *Next*, add a new route for Discord's outgoing webhook (Method: `POST`, Resource path: `/event`) and select your Lambda function as integration target
14. Leave the rest as-is and create the API
15. Note down your custom *Invoke URL* and add your resource path to it (format: `https://abcdef1234.execute-api.us-east-2.amazonaws.com/event`)
16. Save it as Interactions Endpoint URL in the Discord Developer Portal
17. Everything should work fine!

### Additional notes
- Please note that **syncing your commands in the Lambda handler is not recommended** because AWS will destroy and recreate your execution environment as needed, which could lead to a lot of unnecessary requests to the Discord API.
  - A more efficient approach would be to create a separate function for syncing the commands and removing `syncCommands()` from the handler.
- Unlike when running a bot user, AWS Lambda and other endpoint webhooks use a traditional HTTP request/response architecture.
  - This means you only have the ability to send a single response (`.defer()` or `.send()`) for each incoming interaction.
  - For the same reason, a `.defer()` will not be actually sent until the lambda terminates, so you shouldn't perform a long-running operation after you `.defer()`.
  - If you need to defer and *then* send a follow-up, you will have call `.defer()`, and then trigger some sort of side effect that calls one of the non-response methods such as `.sendFollowUp()` **from another source**.
  - For example, with Lambda, you will likely need to invoke a second, different lambda, pass it a payload that includes the interaction you're handling, and then call `.defer()`.
  - This second lambda can then perform a long-running query and then call `.sendFollowUp()`
