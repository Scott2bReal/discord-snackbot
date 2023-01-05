import { VercelRequest, VercelResponse } from '@vercel/node'
import {
  deleteCommand,
  discordAPI,
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
  availRequestSendMessage,
  deleteCommandsMenu,
  eventInfoMessage,
  eventSelectMenu,
  removeShowMenu,
  userSelectMenu,
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

const prisma = new PrismaClient()

export default async function (req: VercelRequest, res: VercelResponse) {
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

    logJSON(message, `Received request`)
    console.log(`Message type: `, message.type)

    /*
    Slash command listeners

    Most of these are simple, we just need to respond to a slash command
    request from Discord with a 200 code and whatever content we want the
    bot to display
    */

    if (message.type === 2) {
      // Test command
      const commandName = message.data.name

      if (commandName === 'test') {
        return res.status(200).send({
          ...basicEphMessage(`Tested!`),
        })
      }

      // Event Info
      if (commandName === 'eventinfo') {
        try {
          const events = await prisma.event.findMany()
          if (!events) throw new Error(`Couldn't find events`)

          console.log(`Successfully found events!`)
          return res.status(200).send({
            type: 4,
            data: {
              ...eventSelectMenu(events),
            },
          })
        } catch (e) {
          console.error(e)
          return res.status(200).send({
            ...basicEphMessage(
              `OoOoOps, I messed up trying to find events. Try again or talk to Scott!`
            ),
          })
        }
      }

      // List users
      if (commandName === 'listusers') {
        const users = await prisma.user.findMany()
        const userNames = users.map((user) => user.userName)

        return res.status(200).send({
          ...basicEphMessage(
            `Here are the users I know about: ${userNames.join(', ')}`
          ),
        })
      }

      // Add user
      if (commandName === 'adduser') {
        return res.status(200).send({
          type: 4,
          data: {
            ...userSelectMenu,
            flags: 64,
          },
        })
      }

      // Open availability modal
      if (commandName === 'availability') {
        return res.status(200).send({
          type: 9,
          data: {
            ...availModal,
          },
        })
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

    // Message Component Submissions
    if (message.type === 3) {
      const menuName = message.message.interaction.name

      // User clicked confirm button after creating avail request
      if (message.data.custom_id?.split(':')[0] === 'availConfirmSend') {
        try {
          const eventId = message.data.custom_id.split(':')[1]

          if (typeof eventId !== 'string') {
            throw new Error(`Event ID needs to be a string`)
          }

          const event = await prisma.event.findUnique({
            where: {
              id: eventId,
            },
          })

          if (!event) throw new Error(`Couldn't find event`)

          return res.status(200).send({
            ...basicEphMessage(`Great, I'll ask everyone about ${event.name}`),
          })
          // TODO message all users with event info
        } catch (e) {
          console.error(e)
          return res
            .status(200)
            .send(
              `Beep boop :( Something went wrong and I couldn't send that message`
            )
        }
      }

      // Event Info Select Menu Submission
      if (menuName === 'eventinfo') {
        try {
          const eventId = message.data.values[0]
          if (typeof eventId !== 'string') throw new Error(`Improper event ID`)
          const event = await prisma.event.findUnique({
            where: {
              id: eventId,
            },
            include: {
              responses: {
                include: {
                  user: true,
                },
              },
            },
          })
          if (!event) throw new Error(`Error finding event in DB`)
          console.log(`Found event! Sending message...`)
          console.log(eventInfoMessage(event))
          return res.status(200).send({
            type: 4,
            data: {
              flags: 64,
              content: eventInfoMessage(event),
            },
          })
        } catch (e) {
          console.error(e)
          return res.status(200).send({
            ...basicEphMessage(
              `Yikes, I messed up finding info about that event (beep boop)`
            ),
          })
        }
      }

      // Add User Submission
      if (menuName === 'adduser') {
        const userId = Object.keys(message.data.resolved.users)[0]
        const userName = message.data.resolved.users[userId].username

        try {
          console.log(`Adding user to db...`)
          await prisma.user.create({
            data: {
              id: userId,
              userName: userName,
            },
          })

          return res.status(200).send({
            ...basicEphMessage(
              `Added user ${userName} to my data banks. Beep boop!`
            ),
          })
        } catch (e) {
          console.error(e)
          return res.status(200).send({
            ...basicEphMessage(
              `Something went wrong adding that user! They may already be in my data banks. Try again, and ask Scott if it doesn't work`
            ),
          })
        }
      }

      // Remove Show Menu Submission
      if (menuName === 'removeshow') {
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

        const showsDeleted = `${
          showsToRemove.length === 1
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
      if (menuName === 'delete') {
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
              `I deleted ${commandsToDelete} command${
                commandsToDelete === 1 ? '' : 's'
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
        const requesterId = message.member.user.id as string

        try {
          // Add event to DB
          const event = await prisma.event.create({
            data: {
              date: eventDate,
              name: eventName,
              userId: requesterId,
            },
          })

          console.log(`Added event to DB!`)
          logJSON(availRequestSendMessage(event))
          return res.status(200).send({
            type: 4,
            data: {
              ...availRequestSendMessage(event),
            },
          })
        } catch (e) {
          console.error(e)
          return res.status(200).send({
            ...basicEphMessage(
              `Something went wrong, I can't remember anything about that event you just told me about! Try again, and if it doesn't work then talk to Scott`
            ),
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
              `Beep Boop! I just added that show to the website. Check it out at https://nastysnacks.netlify.app/#shows`
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
