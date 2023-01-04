import { VercelRequest, VercelResponse } from '@vercel/node'
import {
  // deleteCommand,
  // discordAPI,
  // installCommands,
  isValidReq,
} from '../utils/discord'
import { addShowModal, availModal } from '../utils/modals'
import { getShowData, isValidDate, isValidLocation } from '../utils/helpers'
import { sanityAPI } from '../utils/sanity'

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    // Discord wants to verify requests
    const validReq = isValidReq(req)
    if (!validReq) {
      return res.status(401).send({ error: 'Bad req signature ' })
    }

    const message = req.body

    // Handle verfication "PING" request from Discord
    if (message.type === 1) {
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

      // Open availability modal
      if (message.data.name.toLowerCase() === 'availability') {
        return res.status(200).send({
          type: 9,
          data: {
            ...availModal,
          },
        })
      }

      if (message.data.name.toLowerCase() === 'addshow') {
        return res.status(200).send({
          type: 9,
          data: {
            ...addShowModal,
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

      // Add Show Modal Submission
      if (message.data.custom_id === 'addShow') {
        const dateString = message.data.components[2].components[0].value
        const location = message.data.components[3].components[0].value

        // Check date and ask for new one if no good
        if (!(typeof dateString === 'string') || !isValidDate(dateString)) {
          return res.status(200).send({
            type: 4,
            data: {
              content: `Sorry, I couldn't understand the date you asked me about. Please ask me to check dates in exactly this format: "YYYY-MM-DD". The date you submitted was: ${dateString}`,
              flags: 64,
            },
          })
        } else if (typeof location !== 'string' || !isValidLocation(location)) {
          return res.status(200).send({
            type: 4,
            data: {
              content: `Sorry, I don't know where ${location} is. I can only understand locations if they contain a city name and a state code (e.g. Chicago, IL)`,
              flags: 64,
            },
          })
        }

        const showData = getShowData(message)

        try {
          await sanityAPI('shows', {
            mutationType: 'create',
            data: {
              ...showData,
            },
          })

          return res.status(200).send({
            type: 4,
            data: {
              content: `Thanks! I just added that show to the website. Check it out at https://nastysnacks.netlify.app/#shows`,
              flags: 64,
            },
          })
        } catch (e) {
          console.error(e)
          return res.status(200).send({
            type: 4,
            data: {
              content: `Something went wrong adding that show to the website! You can try again, or visit https://nastysnacks.sanity.studio to add a show.`,
              flags: 64,
            },
          })
        }
      }
    }
  }

  return res.status(200).send('')
}
