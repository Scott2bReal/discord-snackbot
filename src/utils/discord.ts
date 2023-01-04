import { VercelRequest } from '@vercel/node'
import nacl from 'tweetnacl'
import { ApplicationCommand, GuildMember } from '../types'
import { COMMANDS } from './commands'

export async function discordAPI(
  endpoint: string,
  method: string,
  body?: object
) {
  const options: RequestInit = {
    method: method,
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent':
        'snackbot (https://github.com/Scott2bReal/discord-snackbot, 1.0.0)',
    },
  }

  const url = 'https://discord.com/api/v10/' + endpoint
  if (body !== undefined) options.body = JSON.stringify(body)

  return await fetch(url, options)
    .then((res) => res.json())
    .catch((e) => console.error(e))
}

export async function installCommands() {
  // Get all installed commands
  const installed = await getInstalledCommands()

  if (!installed) return

  // Filter list of COMMANDS to only those which are not installed
  const uninstalled = findUninstalledCommands(installed)
  console.log(`Uninstalled: `, uninstalled)

  // If no commands are not installed, return
  if (!uninstalled || uninstalled.length === 0) return

  // For each uninstalled command, install that command
  return await Promise.allSettled(
    uninstalled.map(async (commandName) => {
      await installGuildCommand(commandName)
    })
  )
}

export async function deleteCommand(commandID: string) {
  const appId = process.env.DISCORD_BOT_ID
  const guildId = process.env.SNACKS_GUILD_ID

  const endpoint = `applications/${appId}/guilds/${guildId}/commands/${commandID}`
  console.log(`Deleting command ${commandID}`)
  return await discordAPI(endpoint, 'DELETE')
}

function findUninstalledCommands(installed: Array<ApplicationCommand>) {
  // Compare list of installed commands to our registered commands (defined in
  // ./commands.js). Return list of uninstalled command names
  const myCommands = Object.keys(COMMANDS)
  console.log(`My commands: `, myCommands)
  const installedNames = installed.map((command) => command.name)

  return myCommands.filter((commandName) => {
    return !installedNames.includes(commandName)
  })
}

export function isValidReq(req: VercelRequest) {
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

export async function getInstalledCommands() {
  const appId = process.env.DISCORD_BOT_ID
  const guildId = process.env.SNACKS_GUILD_ID

  if (!appId || !guildId) return []

  const endpoint = `applications/${appId}/guilds/${guildId}/commands`

  try {
    const res = await discordAPI(endpoint, 'GET')

    console.log(`Installed commands: `, res)
    return res as Array<any>
  } catch (err) {
    console.error(err)
  }
}

export async function installGuildCommand(commandName: string) {
  const appId = process.env.DISCORD_BOT_ID
  const guildId = process.env.SNACKS_GUILD_ID
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`
  const command = COMMANDS[commandName]

  try {
    console.log(`Installing `, commandName)
    const result = await discordAPI(endpoint, 'POST', command)
    return result
  } catch (e) {
    console.error(e)
  }
}

export async function getAllGuildMembers() {
  return (await discordAPI(
    `/guilds/${process.env.SNACKS_GUILD_ID}/members?limit=10`,
    'GET'
  )) as GuildMember[]
}
