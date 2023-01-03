import { VercelRequest, VercelResponse } from '@vercel/node'
// import { logJSON } from '../utils/loggers'
import { deleteCommand, installCommands, isValidReq } from '../utils/discord'
import { logJSON } from '../utils/loggers'

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    // Discord wants to verify requests
    const validReq = isValidReq(req)
    if (!validReq) {
      console.error('Invalid req\n')
      return res.status(401).send({ error: 'Bad req signature ' })
    }

    const message = req.body

    // Handle verfication "PING" request from Discord
    if (message.type === 1) {
      console.log(`Valid request!\n`)
      return res.status(200).send({
        type: 1,
      })
    }

    // Install any commands which aren't already registered
    await installCommands()

    // Slash command listeners
    if (message.type === 2) {
      logJSON(message, `Received slash command`)

      // Test command
      if (message.data.name.toLowerCase() === 'TEST'.toLowerCase()) {
        return res.status(200).send({
          type: 4,
          data: {
            content: 'Tested!',
            flags: 64,
          },
        })
      }

      if (message.data.name.toLowerCase() === 'availability') {
        return res.status(200).send({
          type: 9,
          data: {
            content: 'Tested!',
          }
        })
      }
    }
  }
}
