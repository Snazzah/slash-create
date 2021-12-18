You can deploy the template with [Cloudflare Workers](https://workers.cloudflare.com) by clicking the button below:

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Snazzah/slash-create-worker)


The [template](https://github.com/Snazzah/slash-create-worker) has a CFWorkerServer and shims the library to handle requests and allowing extra requests after the initial response. You can create a new repo from the "Deploy to Cloudflare Workers" and clone the repo afterwards.

## Getting Started
### Cloning the repo
You can either use degit to locally clone this repo without git, or [create a new repo from this template](https://github.com/Snazzah/slash-create-worker/generate) and clone that.
```sh
npx degit Snazzah/slash-create-worker
```

After that, make sure to install dependencies using npm or yarn:
```sh
npm install
# yarn
```
### Installing and setting up Wrangler
> Make sure to [sign up for a Cloudflare Workers account](https://dash.cloudflare.com/sign-up/workers) in a browser before continuing.
Install wrangler with npm or yarn:
```sh
npm install -g @cloudflare/wrangler
# yarn global add @cloudflare/wrangler
```
Read more about [installing wrangler](https://developers.cloudflare.com/workers/cli-wrangler/install-update).

Afterwards, run `wrangler login` to login to your Cloudflare account with OAuth:
```sh
wrangler login
```

Copy `wrangler.example.toml` into `wrangler.toml`. Make sure to fill in your account ID in the config and update the name of the worker. You can find your account ID [here](https://dash.cloudflare.com/?to=/:account/workers) towards the right side.

### Filling in secrets
You can enter in environment secrets with `wrangler secret put`, here are the keys that are required to run this:
```sh
wrangler secret put DISCORD_APP_ID
wrangler secret put DISCORD_PUBLIC_KEY
wrangler secret put DISCORD_BOT_TOKEN
```
For a development environment, you can also include `COMMANDS_DEV_GUILD` for commands to be updated in that guild live
```sh
wrangler secret put DISCORD_APP_ID -e development
wrangler secret put DISCORD_PUBLIC_KEY -e development
wrangler secret put DISCORD_BOT_TOKEN -e development
wrangler secret put COMMANDS_DEV_GUILD -e development
```
> If an error occurs when trying to create a worker to put the secret in, create a worker manually in the dashboard and set the subdomain. It will be overwritten later.

### Development
You can run `npm run dev` to start a development environment and use something like ngrok to tunnel it to a URL. To sync commands, copy `.env.example` to `development.env` and fill in the variables, then run `npm run sync:dev`.

> Note: When you create a command, **make sure to include it in the array of commands in `./src/commands/index.ts`**.

### Production
To sync to production, copy `.env.example` to `.env` and fill in the variables, then run `npm run sync`. To publish code to a worker, run `npm run deploy`.
