import { VercelRequest, VercelResponse } from '@vercel/node'
// import { verifyKey } from "discord-interactions";
import { logJSON } from '../utils/loggers'
import { InteractionResponseType, InteractionType } from 'discord-interactions'
import { installCommands, isValidReq } from '../utils/discord'

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    // Discord wants to verify requests
    const validReq = isValidReq(req)
    if (!validReq) {
      console.error('Invalid req\n')
      return res.status(401).send({ error: 'Bad req signature ' })
    }

    const message = req.body
    console.log(`message type: `, message.type)

    // Handle verfication "PING" request from Discord
    if (message.type === InteractionType.PING) {
      console.log(`Valid request!\n`)
      return res.status(200).send({
        type: InteractionResponseType.PONG,
      })
    }

    // Install any commands which aren't already registered
    await installCommands()

    // Slash command listeners
    if (message.type === InteractionType.APPLICATION_COMMAND) {
      logJSON(message, `Received slash command`)
      if (message.data.name.toLowerCase() === 'TEST'.toLowerCase()) {
        return res.status(200).send({
          type: 4,
          data: {
            content: 'Tested!',
            flags: 64,
          },
        })
      }
    }
  }
}
