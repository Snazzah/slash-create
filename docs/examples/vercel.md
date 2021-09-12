**➡️ Please note that a working templatereference can be found [here](https://github.com/GabrielTK/VercelSlashCreate).**

The most important thing is to:
1. Export the VercelServer instance:
```ts
const { VercelServer } = require('slash-create');
const vercelServer = new VercelServer();
creator
  .withServer(vercelServer)
  .registerCommandsIn(path.join(__dirname, 'commands'))
  //.syncCommands()

export const vercel = vercelServer;
export const slash = creator;
```
2. Then, create a directory called `api`, with the two following files:

* `interactions.ts`
```ts
import { vercel } from ".."; //This is the VercelServer we exported from the previous step.


export default vercel.vercelEndpoint;
```

* `resync.ts` - This file can be renamed, and will be used to resync the interactions with Discord API. I recommend you use this as a post-deploy hook.

```ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import { slash } from "..";

const api = async (req: VercelRequest, res: VercelResponse) => {
  //I do recommend you add secret verification here, or some security check.
  slash.syncCommands();
  //This basically waits until the sync is done
  let awaiter = new Promise((resolve,reject) => {
  slash.on('synced', () => {
    console.log("Elapsed Sync")
   resolve(true);
  });
  });
  slash.syncCommands();
  await awaiter;
  res.status(200).send(JSON.stringify(slash.commands.map(c => [{name: c.commandName, description: c.description}])));
}
export default api;
```

Now, just push it to Vercel! Be sure to verify that the source files are not exposed, and that `/api/interactions` results in a response such as `Server only supports POST requests.` - That's the URL you'll use as your `INTERACTIONS ENDPOINT URL` on your [Discord Developers Page](https://discord.com/developers/)



