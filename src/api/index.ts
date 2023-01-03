import { VercelRequest, VercelResponse } from '@vercel/node'
// import { verifyKey } from "discord-interactions";
import { logJSON } from '../utils/loggers'
import { InteractionResponseType, InteractionType } from 'discord-interactions'
import isValidReq, {
  installGuildCommands,
  TEST_COMMAND,
} from '../utils/discord'

export default async function (req: VercelRequest, res: VercelResponse) {
  logJSON(req.headers, `Request headers`)
  logJSON(req.body, `Request body`)

  installGuildCommands()

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

    if (message.type === InteractionType.APPLICATION_COMMAND) {
      logJSON(message, `Received slash command`)
      if (message.data.name.toLowerCase() === TEST_COMMAND.name.toLowerCase()) {
        res.status(200).send({
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
