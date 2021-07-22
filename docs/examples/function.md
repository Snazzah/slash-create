
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

Next, open `function.json` and replace *the bindings section* by this. See [details](#details) if you care about how it works.

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
 + Press CTRL + SHIFT + P to open the command prompt
 + Search for "Azure Functions : Deploy to Function App.."
 + Follow the prompts, creating a new fucntion app when prompted
 + Once deployed, open the command prompt and select "Azure Functions: Retrieve Function URL"
 + Follow the prompts and you should have the Function's invocation URL in the clipboard. This URL should follow this pattern:   
 
    https://[function-app-name].azurewebsites.net/api/[function-name]

You can also retrieve this URL in the Azure Portal.

## Discord configuration

+ Go to [Discord developers](https://discord.com/developers/applications). 
+ Select / Create a new application. On the application page, fill the "Interactions endpoint URL" input with the retrieved Function URL.  
+ Invite your application to your server using this URL : https://discord.com/oauth2/authorize?client_id=[client-id]&scope=applications.commands
+ You're ready to go !

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
