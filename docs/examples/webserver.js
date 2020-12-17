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
