
## Creating the Function

 - Create a new empty directory, and open it with VS Code
 - Install the [Azure Functions](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions) VS Code extension
 - Press <kbd>CTRL</kbd> + <kbd>SHIFT</kbd> + <kbd>P</kbd> to open the command prompt
 - Select **Azure Functions: Create new Project**
 - Select the current directory
 - Select either **TypeScript** or **JavaScript** when prompted for a language
 - Select **HTTP trigger** when prompted for a template
 - Type any function name you want
 - Select **Anonymous** when prompted for the "Authorization Level"
 - A new function should be created!

 Be aware that you can also do all these steps in the Azure Portal. 

## Building and deploying the Function


### Building the Function 

Now that you created a Function, your folder structure should look like this: 

```
├── [Function name]
│   ├── function.json
│   ├── sample.dat
│   └── index.js
├── host.json
├── local-settings.json
├── proxies.json
└── package.json
```

Open `index.js` and replace its content by this:

```js
const { AzureFunctionServer, SlashCreator } = require('slash-create');

const creator = new SlashCreator({
    applicationID: process.env.DISCORD_APP_ID,
    publicKey: process.env.DISCORD_PUBLIC_KEY,
    token: process.env.DISCORD_BOT_TOKEN
});

creator
  // The first argument is required, but rhe second argument is the "target" or the name of the export.
  // By default, the target is "interactions".
  .withServer(new AzureFunctionServer(module.exports))
  .registerCommandsIn(path.join(__dirname, 'commands'))
  // Syncing the commands each time the function is executed is wasting computing time
  .syncCommands();

```

Next, open `function.json` and replace the `bindings` property to the following. Scroll down to the Details section for more info on how it works.

```json
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": [
        "post"
      ]
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ],
```

**Don't forget to create a "commands" directory in the "[Function name] directory with some sample commands.**

The last thing is to deploy the function.

### Deploying the Function 
 - Press <kbd>CTRL</kbd> + <kbd>SHIFT</kbd> + <kbd>P</kbd> to open the command prompt again
 - Search for **Azure Functions: Deploy to Function App...**
 - Follow the prompts, creating a new function app when prompted
 - Once deployed, open the command prompt and select "Azure Functions: Retrieve Function URL"
 - Follow the prompts and you should have the function's invocation URL in the clipboard. This URL should follow this pattern:   
 
    https://[function-app-name].azurewebsites.net/api/[function-name]

You can also retrieve this URL in the Azure Portal.

## Discord configuration

- Go to to [Discord Developers Portal Applications Page](https://discord.com/developers/applications). 
- Select / Create a new application. On the application's page, fill the "Interactions endpoint URL" input with the retrieved Function URL.  
- Invite your application to your server using this URL: `https://discord.com/oauth2/authorize?client_id=[client-id]&scope=applications.commands`
- You're ready to go!

## Debugging locally 
Waiting for the function to deploy over and over again each time you are a experimenting with a new feature can be tedious. To circumvent this problem, it is possible to create a local server. 

1. Install [azure-cli](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli), and the [Azure Functions runtime](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local) **Version 3.x**.
2. Start the function locally by running `func start` or `npm run start` in the [Function name] directory.

By default, the function will start on port 7071. The **local** function invocation URL should be:

    https://localhost:7071/api/[function-name]

However, you need a public URL to use in interactions. An easy way to do this is with [ngrok](https://ngrok.com/). ([download](https://ngrok.com/download))
- In another terminal, run `ngrok http 7071`. This will prompt you with a "https://*.ngrok.io" URL. You can now follow the **Discord configuration** part above, and fill the "Interactions endpoint URL" input with the ngrok URL.
- **Note**: Be aware that the ngrok URL will expire after 2 hours. You will need to restart the ngrok command after this delay.

## Details

Azure Functions use something called [bindings](https://docs.microsoft.com/en-us/azure/azure-functions/functions-triggers-bindings?tabs=javascript). This is a fancy way of decoupling components. The bindings section above declares two bindings

```jsonc
  "bindings": [
    {
      // The first binding is an input binding ...
      "direction": "in",
      // That is an incoming HTTP POST request...
      "type": "httpTrigger",
      "methods": [
        "post"
      ],
      // Without authorization...
      "authLevel": "anonymous",
      // Bound to the variable "req" in the function's context
      "name": "req"

    },
    {
      // The second binding is an output binding ...
      "direction": "out",
      // That is an outgoing HTTP request...
      "type": "http",
      // Bound to the variable "res" in the function's context
      "name": "res"
    }
  ],
```
