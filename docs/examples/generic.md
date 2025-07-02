
The Generic Server is primarily suited towards working with frameworks that handle the HTTP Requests and Responses by themselves, such as SvelteKit or SolidStart. As such, the server endpoint effectively becomes a function to process the Request and return a Response that you can pass back to your frameworks routing.

# SvelteKit Example

You can quickly create a SvelteKit project by running [`npx cv create`](https://svelte.dev/docs/kit/creating-a-project):
```
npx sv create my-app
cd my-app
npm install
npm run dev
```

Afterwards, you can add the following code to your [library folder](https://svelte.dev/docs/kit/lib) to create a global slash instance and export its endpoint:

```js
// ./lib/slash.ts
import { SlashCreator, GenericServer } from "slash-create";
import * as commands from "./commands";

const slash = new SlashCreator({
	applicationID: DISCORD_APP_ID,
	publicKey: DISCORD_PUBLIC_KEY,
	token: DISCORD_BOT_TOKEN,
});

slash.withServer(new GenericServer())
await creator.registerCommands(Object.values(commands)); // Will run at build-time, syncing commands as it is being deployed.

export const endpoint = (slash.server! as GenericServer).endpoint;
```

And create a [+server.ts endpoint](https://svelte.dev/docs/kit/routing#server) for that slash server to be exposed through.

```ts
// ./src/routes/interactions/+server.ts
import endpoint from "$lib/slash";

export async function POST({ request }) {
	return await endpoint(request);
}

export const config = {
	runtime: "nodejs22.x", // For Vercel edge functions. Can be otherwise removed.
};
```

