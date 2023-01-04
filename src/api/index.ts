import { VercelRequest, VercelResponse } from '@vercel/node'
// import { logJSON } from '../utils/loggers'
import { deleteCommand, installCommands, isValidReq } from '../utils/discord'
import { availModal } from '../utils/modals'
import { isValidDate } from '../utils/helpers'

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
    // await installCommands()

    // Slash command listeners
    if (message.type === 2) {
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
            ...availModal,
          },
        })
      }
    }

    // Modal Submissions
    if (message.type === 5) {

      // Availability Request Modal Submission
      if (message.data.custom_id === 'availRequest') {
        const submitted = message.data.components[1].components[0].value

        // We need the dates in a specific format to make sure we can convert them to actual dates
        if (!(typeof submitted === 'string') || !isValidDate(submitted)) {
          return res.status(200).send({
            type: 4,
            data: {
              content: `Sorry, I couldn't understand the date you asked me about. Please ask me to check dates in exactly this format: "YYYY-MM-DD". The date you submitted was: ${submitted}`,
              flags: 64,
            },
          })
        }

        // Now that we know we can work with the data, let's grab it and do stuff
        const eventDate = new Date(`${submitted}T00:00:00-06:00`)
        const eventName = message.data.components[0].components[0].value

        return res.status(200).send({
          type: 4,
          data: {
            content: `Thanks! I'll check in with everyone about ${eventName} on ${eventDate.toDateString()} and report back when I know their availabilities`,
            flags: 64,
          },
        })
      }
    }
  }

  return res.status(200).send('')
}
