import { VercelRequest, VercelResponse } from '@vercel/node'
import {
  deleteCommand,
  getInstalledCommands,
  // discordAPI,
  // deleteCommand,
  // discordAPI,
  installCommands,
  isValidReq,
} from '../utils/discord'
import {
  addShowModal,
  availModal,
  deleteCommandsMenu,
  removeShowMenu,
} from '../utils/interactives'
import {
  basicEphMessage,
  getShowData,
  isValidDate,
  isValidLocation,
  logJSON,
} from '../utils/helpers'
import { sanityAPI } from '../utils/sanity'
import { Show } from '../types'
import { PrismaClient } from '@prisma/client'

export default async function(req: VercelRequest, res: VercelResponse) {
  const prisma = new PrismaClient()
  if (req.method === 'POST') {
    // Discord wants to verify requests
    if (!isValidReq(req)) {
      return res.status(401).send({ error: 'Bad req signature ' })
    }

    const message = req.body

    // Handle verfication "PING" request from Discord
    if (message.type === 1) {
      return res.status(200).send({
        type: 1,
      })
    }

    // logJSON(message, `Received request`)

    /*
    Slash command listeners

    Most of these are simple, we just need to respond to a slash command
    request from Discord with a 200 code and whatever content we want the
    bot to display
    */

    if (message.type === 2) {
      const commandName = message.data.name

      // Test command
      if (commandName === 'test') {
        return res.status(200).send({
          ...basicEphMessage(`Tested!`),
        })
      }

      // Open availability modal
      if (commandName === 'availability') {
        const users = await prisma.user.findMany()

        logJSON(users, `Users in DB`)
        return res.status(200).send({
          type: 9,
          data: {
            ...availModal,
          },
        })
      }

      // Display list of events in DB
      if (commandName === 'listevents') {
        try {
          console.log(`Fetching list of events...`)

          const events = await prisma.event.findMany({
            include: {
              requester: true,
              responses: true,
            }
          })

          if (events.length === 0) {
            return res.status(200).send({
              ...basicEphMessage(`There are no events that I know of`),
            })
          }

          const eventList = events.map((e) => e.name).join(', ')
          console.log(eventList)

          return res.status(200).send({
            ...basicEphMessage(eventList),
          })
        } catch (e) {
          console.error(e)
          return res.status(200).send({
            ...basicEphMessage(`Something went wrong fetching those events`),
          })
        }
      }

      // Open add show modal
      if (commandName === 'addshow') {
        return res.status(200).send({
          type: 9,
          data: {
            ...addShowModal,
          },
        })
      }

      // Remove show select menu
      if (commandName === 'removeshow') {
        // Get list of shows from Sanity to populate list
        console.log(`Fetching shows from sanity...`)
        const result = await sanityAPI('shows')

        const shows = result.result as Show[]
        logJSON(shows, `Shows in Sanity`)

        return res.status(200).send({
          type: 4,
          data: {
            ...removeShowMenu(shows),
            flags: 64,
          },
        })
      }

      // Install commands
      if (commandName === 'install') {
        await installCommands()
        return res.status(200).send({
          ...basicEphMessage(`I've installed any new commands!`),
        })
      }

      // Delete command
      if (commandName === 'delete') {
        // Get list of installed commands
        const commands = await getInstalledCommands()
        console.log(`Installed commands: `, commands)

        // Give user a list of commands to choose from
        if (commands) {
          return res.status(200).send({
            type: 4,
            data: {
              ...deleteCommandsMenu(commands),
              flags: 64,
            },
          })
        }

        // If we're here then there are no commands
        return res.status(200).send({
          ...basicEphMessage(`There are no commands to delete!`),
        })
      }
    }

    // Select Menu Submissions
    if (message.type === 3) {
      // Remove Show Menu Submission
      if (message.message.interaction.name === 'removeshow') {
        // Get ID of user-selected show to delete
        const showsToRemove = message.data.values

        // Delete in Sanity using ID
        await Promise.allSettled(
          showsToRemove.map(async (showID: string) => {
            await sanityAPI('shows', {
              mutationType: 'delete',
              data: { id: showID },
            })
          })
        )

        const showsDeleted = `${showsToRemove.length === 1
            ? 'one show'
            : `${showsToRemove.length} shows`
          }`

        // Confirm deletion
        return res.status(200).send({
          ...basicEphMessage(
            `I removed ${showsDeleted} for you! If you need to undo this, you can still find and restore deleted shows at https://nastysnacks.sanity.studio`
          ),
        })
      }

      // Delete Commands Menu Submission
      if (message.message.interaction.name === 'delete') {
        // Get IDs of commands user wants to delete
        logJSON(message, `Received delete command submission`)
        const ids = message.data.values as string[]
        const commandsToDelete = ids.length
        if (commandsToDelete === 0) return res.status(200).send('')

        // For each of those commands, delete
        try {
          await Promise.allSettled(
            ids.map(async (id) => {
              return await deleteCommand(id)
            })
          )

          return res.status(200).send({
            ...basicEphMessage(
              `I deleted ${commandsToDelete} command${commandsToDelete === 1 ? '' : 's'
              }. If you'd like to reinstall, you can run /install`
            ),
          })
        } catch (e) {
          console.error(e)
          return res.status(200).send({
            ...basicEphMessage(
              `Something went wrong trying to delete commands! Try again or hit up Scott`
            ),
          })
        }
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
            ...basicEphMessage(
              `Sorry, I couldn't understand the date you asked me about. Please ask me to check dates in exactly this format: "YYYY-MM-DD". The date you submitted was: ${submitted}`
            ),
          })
        }

        // Now that we know we can work with the data, let's grab it and do stuff
        const eventDate = new Date(`${submitted}T00:00:00-06:00`)
        const eventName = message.data.components[0].components[0].value
        const requester = message.member.user.id

        // Create event in DB

        try {
          // prisma.event.create({
          //   data: {
          //     name: eventName,
          //     requester: requester,
          //     date: eventDate,
          //   },
          // })
          return res.status(200).send({
            ...basicEphMessage(
              `Thanks! I'll check in with everyone about ${eventName} on ${eventDate.toDateString()} and report back when I know their availabilities`
            ),
          })
        } catch (e) {
          console.error(e)
          return res.status(200).send({
            ...basicEphMessage(`Something went wrong processing that event`),
          })
        }
      }

      // Add Show Modal Submission
      if (message.data.custom_id === 'addShow') {
        const dateString = message.data.components[2].components[0].value
        const location = message.data.components[3].components[0].value

        // Check date and ask for new one if no good
        if (!(typeof dateString === 'string') || !isValidDate(dateString)) {
          return res.status(200).send({
            ...basicEphMessage(
              `Sorry, I couldn't understand the date you asked me about. Please ask me to check dates in exactly this format: "YYYY-MM-DD". The date you submitted was: ${dateString}`
            ),
          })
        } else if (typeof location !== 'string' || !isValidLocation(location)) {
          return res.status(200).send({
            ...basicEphMessage(
              `Sorry, I don't know where ${location} is. I can only understand locations if they contain a city name and a state code (e.g. Chicago, IL)`
            ),
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
            ...basicEphMessage(
              `Thanks! I just added that show to the website. Check it out at https://nastysnacks.netlify.app/#shows`
            ),
          })
        } catch (e) {
          console.error(e)
          return res.status(200).send({
            ...basicEphMessage(
              `Something went wrong adding that show to the website! You can try again, or visit https://nastysnacks.sanity.studio to add a show.`
            ),
          })
        }
      }
    }
  }

  return res.status(200).send('')
}
