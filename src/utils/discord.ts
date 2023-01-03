import { VercelRequest } from '@vercel/node'
import nacl from 'tweetnacl'

export default function isValidReq(req: VercelRequest) {
  const signature = req.headers['x-signature-ed25519'] ?? ''
  const timestamp = req.headers['x-signature-timestamp'] ?? ''
  const publicKey = process.env.DISCORD_PUBLIC_KEY ?? ''
  const rawBody = JSON.stringify(req.body)

  if (!(typeof signature === 'string') || !(typeof timestamp === 'string')) {
    return false
  }

  return nacl.sign.detached.verify(
    Buffer.from(timestamp + rawBody),
    Buffer.from(signature, 'hex'),
    Buffer.from(publicKey, 'hex')
  )
}

function hasGuildCommand() {}

export function installGuildCommands() {}

export const COMMANDS = {
  TEST: {
    name: 'Test',
    description: 'Test slash command',
  },
}

export async function register() {
  const guildID = process.env.SNACKS_GUILD_ID ?? ''
  const appID = process.env.DISCORD_BOT_ID ?? ''

  const result = await fetch(
    `https://discord.com/api/v8/applications/${appID}/guilds/${guildID}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
      method: 'PUT',
      body: JSON.stringify([COMMANDS.TEST]),
    }
  )

  if (result.ok) {
    console.log(`Registered commands`)
  } else {
    console.error(`Error registering commands`)
    const text = await result.text()
    console.error(text)
  }
}

export async function discordAPI(endpoint: string, body?: object) {
  const options: RequestInit = {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent':
        'snackbot (https://github.com/discord/discord-example-app, 1.0.0)',
    },
  }

  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint

  // Stringify payloads
  if (body !== undefined) options.body = JSON.stringify(body)

  // Use node-fetch to make requests
  return await fetch(url, options)
    .then((res) => res.json())
    .catch((e) => console.error(e))
}
