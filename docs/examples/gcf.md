Before using the server, check out [how to use the functions module](https://www.npmjs.com/package/@google-cloud/functions-framework).

```js
const { GCFServer } = require('slash-create');

creator
  // The first argument is required, but rhe second argument is the "target" or the name of the export.
  // By default, the target is "interactions".
  .withServer(new GCFServer(module.exports))
  .registerCommandsIn(path.join(__dirname, 'commands'));
```

If you want more examples of using Google services, check out [jasondamour/discord-gcloud-commands](https://github.com/jasondamour/discord-gcloud-commands).
