<div align="center">

<img src="/static/textlogo.png" height="50">

[![NPM version](https://img.shields.io/npm/v/slash-create?maxAge=3600)](https://www.npmjs.com/package/slash-create) [![NPM downloads](https://img.shields.io/npm/dt/slash-create?maxAge=3600)](https://www.npmjs.com/package/slash-create) [![ESLint status](https://github.com/Snazzah/slash-create/workflows/ESLint/badge.svg)](https://github.com/Snazzah/slash-create/actions?query=workflow%3A%22ESLint%22) [![DeepScan grade](https://deepscan.io/api/teams/11596/projects/15103/branches/297399/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=11596&pid=15103&bid=297399) [![discord chat](https://img.shields.io/discord/311027228177727508?logo=discord&logoColor=white)](https://snaz.in/discord)

Create [Discord slash commands](https://discord.com/developers/docs/interactions/application-commands) similar to Discord.JS [Commando](https://github.com/discordjs/Commando).


</div>

## Features
- Multiple server support ([Express](http://expressjs.com/), [Fastify](https://fastify.io/), etc.)
- Hook into an existing Discord bot client
- Sync loaded commands to Discord from slash-create
- Load commands from a folder
- Command throttling/cooldowns

## Quickstart

If you want an easy start on getting slash commands on your bot, you can use [slash-up](https://github.com/Snazzah/slash-up) to create a project using a template.
```
npx slash-up init
```
After creating a project, you can edit commands to your liking and start it up with `yarn start`.

You can also deploy a slash-create template to the following services:

| Cloudflare Workers | Vercel | Heroku | Railway |
|:-:|:-:|:-:|:-:|
| [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Snazzah/slash-create-worker) | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSnazzah%2Fslash-create-vercel&env=DISCORD_APP_ID,DISCORD_PUBLIC_KEY,DISCORD_BOT_TOKEN&envDescription=Variables%20needed%20to%20recognize%20and%20operate%20slash%20commands.&project-name=discord-interactions&repo-name=discord-slash-commands&demo-description=Deploy%20a%20slash-create%20server%20for%20Discord%20interactions.&demo-image=https%3A%2F%2Fget.snaz.in%2F4MVTTaR.png&demo-title=%2Fcreate&demo-url=https%3A%2F%2Fslash-create.js.org) | [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Snazzah/slash-create-template/tree/master) | [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/h6aVmv?referralCode=snazzah) |

## Installation
```sh
npm i slash-create
```
Or, using yarn:
```sh
yarn add slash-create
```

### Using webservers
In order to use a specific webserver, you will need to install the dependency associated with that server. The following server types require these dependencies:
- `AWSLambdaServer`: none technically, meant for use with [AWS Lambda](https://aws.amazon.com/lambda) and [Amazon API Gateway](https://aws.amazon.com/api-gateway), see [example](https://slash-create.js.org/#/docs/main/latest/examples/lambda)
- `AzureFunctionServer`: none technically, meant for use with [Azure Functions](https://docs.microsoft.com/en-us/azure/azure-functions/), see [example](https://slash-create.js.org/#/docs/main/latest/examples/azure)
- `ExpressServer`: `express`
- `FastifyServer`: `fastify`
- `GatewayServer`: none, see [example](https://slash-create.js.org/#/docs/main/latest/examples/discord-bot)
- `GCFServer`: none technically, meant for use with [`@google-cloud/functions-framework`](https://npm.im/@google-cloud/functions-framework), see [example](https://slash-create.js.org/#/docs/main/latest/examples/gcf)
- `VercelServer`: none, see [example](https://slash-create.js.org/#/docs/main/latest/examples/vercel)

## Examples
- [Creating a SlashCreator](https://slash-create.js.org/#/docs/main/latest/examples/basic)
  - [Using Webservers](https://slash-create.js.org/#/docs/main/latest/examples/webserver)
    - [Using `AWSLambdaServer`](https://slash-create.js.org/#/docs/main/latest/examples/lambda)
    - [Using `AzureFunctionServer`](https://slash-create.js.org/#/docs/main/latest/examples/azure)
    - [Using `GCFServer`](https://slash-create.js.org/#/docs/main/latest/examples/gcf)
    - [Using `VercelServer`](https://slash-create.js.org/#/docs/main/latest/examples/vercel)
  - [Using Discord Bots](https://slash-create.js.org/#/docs/main/latest/examples/discord-bot)
- [Creating commands](https://slash-create.js.org/#/docs/main/latest/examples/command)

## Useful Links
- [**Discord Documentation on Application Commands**](https://discord.com/developers/docs/interactions/application-commands)
- [Website](https://slash-create.js.org/) ([source](https://github.com/Snazzah/slash-create-website))
- [Documentation](https://slash-create.js.org/#/docs/main/latest/general/welcome)
- [Commands Template](https://github.com/Snazzah/slash-create-template)
- [GitHub](https://github.com/Snazzah/slash-create)
- [NPM](https://www.npmjs.com/package/slash-create)

<div align="center">
    <a target="_blank" href="https://snaz.in/discord" title="Join the Discord!">
        <img  src="https://discordapp.com/api/guilds/311027228177727508/widget.png?style=banner2" height="76px" draggable="false" alt="Join the Discord!">
    </a>
</div>

##### Resources & References
This project borrows resources and references from the following repositories:
- [dbots.js](https://github.com/dbots-pkg/dbots.js)
- [eris](https://github.com/abalabahaha/eris)
- [discord.js](https://github.com/discordjs/discord.js)
- [Commando](https://github.com/discordjs/Commando)
- [slash-worker](https://github.com/A5rocks/slash-worker)
- [slash-commands](https://github.com/MeguminSama/discord-slash-commands)
- [discord-interactions](https://github.com/discord/discord-interactions-js)
