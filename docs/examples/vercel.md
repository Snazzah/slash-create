
You can deploy the template with [Vercel](https://vercel.com/) by clicking the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSnazzah%2Fslash-create-vercel&env=DISCORD_APP_ID,DISCORD_PUBLIC_KEY,DISCORD_BOT_TOKEN&envDescription=Variables%20needed%20to%20recognize%20and%20operate%20slash%20commands.&project-name=discord-interactions&repo-name=discord-slash-commands&demo-description=Deploy%20a%20slash-create%20server%20for%20Discord%20interactions.&demo-image=https%3A%2F%2Fget.snaz.in%2F4MVTTaR.png&demo-title=%2Fcreate&demo-url=https%3A%2F%2Fslash-create.js.org)


Fill out the environment variables with the credentials from your application's page.
- **Note:** Due to an update in the package's dependencies, the Install Command MUST be `yarn config set ignore-engines true && yarn install` to disable node version checking until Vercel updates to the newest Node version.

Your interactions URL will be the domain of the deployment with `/api/interactions` appended to it. (Example: `https://slash-create.vercel.app`)

> If the build fails, set the Install Command to `yarn config set ignore-engines true && yarn install --network-concurrency 1` on Vercel.


The [template](https://github.com/Snazzah/slash-create-vercel) will handle syncing to Discord after building. You can create a new repo from the template and deploy with Vercel with that repository.

# Limitations

Since the template is using Vercel's serverless functions, **registering components will not work**.
