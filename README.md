# SNACKBOT v2 - Discord Edition

![Snack Bot](https://i.imgur.com/gWyAtsG.jpg)

A Discord Bot to help automate our band's workflows

## Getting Started

If you're not already, using something to manage your node versions would be a good
idea! I'd recommend [`fnm`](https://github.com/Schniz/fnm)

I've included a `.node-version` file, which `fnm` can pick up on automatically
or with an `fnm use`.

Running `npm install` should install all dependencies. 

### Running the Bot Locally

We're hosting this thing on [Vercel](https://vercel.com). Since this bot is
running on their serverless architecture, we'll need to mimic that locally.
Luckily, they have a CLI for that . I believe the `vercel` command should be
available after running npm install, but if it isn't then you can do a good ole
npm install -g vercel.

After setting environment variables, you can run the bot locally by running
`vercel dev`.

### Environment Variables

I *think* that because I have this repo connected to the Vercel project, it
will pick up environment variables automatically. If not, hit me up and we can
figure that out!

### `ngrok`

You'll need to get `ngrok` going in order for Slack to send requests since it
requires https. You can get `ngrok` set up by:

  1. Create an account
  2. Install ngrok locally (download from their site or use your package manager)
  3. Run ngrok http [port] where [port] is 3000 or PORT in ./.env

### Registering with Discord

When developing locally, we'll need to point Discord to the `ngrok` URL. In
order to do this, I'll need to add you as an app tester for the bot. You can
create a Discord developer account, and I can invite you as a tester. The
Interactions Endpoint URL field is located in the General Information section
on the SNACKBOT page.
