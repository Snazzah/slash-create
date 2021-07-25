## Creating a Server
```js
const { ExpressServer } = require('slash-create');

creator
    .withServer(new ExpressServer())
    // Depending on what server is used, this may not be needed.
    .startServer();

/**
 * By default, this serves to `127.0.0.1:80/interactions`.
 * You can change the `serverPort` and `endpointPath` to affect where to serve to.
 */

/**
 * You can also initialize the server with an existing application.
 * If you are doing this with express applications, the express application must already have `express.json()` as middleware.
 */

creator
    // Set `alreadyListening` if the server has already started.
    .withServer(new ExpressServer(app, { alreadyListening: true }));
```

## Debugging locally

You can expose the local server url using [ngrok](https://ngrok.com/). 

First, download and install ngrok.
Then type **ngrok http 80** in a new terminal. This will create a https://*.ngrok.io url. All calls to this URL will be redirected to localhost:80.

To instruct discord to use your server for all user-created interactions, you must :
- Go to to [Discord Developers Portal Applications Page](https://discord.com/developers/applications). 
- Select / Create a new application. On the application's page, fill the "Interactions endpoint URL" input with the https://*.ngrok.io/interactions url.
- Invite your application to your server using this URL: `https://discord.com/oauth2/authorize?client_id=[client-id]&scope=applications.commands`
- You're ready to go!

Be aware that the ngrok url expires after 2h, you'll have to restart the ngrok command after this delay.


## Production considerations

The simplest way to use the created server is to use http://[server-public-ip]/interactions as a "Interactions endpoint URL" (see "Debugging locally" section above).
