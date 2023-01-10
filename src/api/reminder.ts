import { PrismaClient } from '@prisma/client'
import { VercelRequest, VercelResponse } from '@vercel/node'
import { isUpcoming } from '../utils/helpers'
import { requestAvailFromUser } from '../utils/messagesAndModals'

const prisma = new PrismaClient()
const SNACKBOT_ID = '1059704679677841418'
export default async function (req: VercelRequest, res: VercelResponse) {
  try {
    // Find all users
    const users = await prisma.user.findMany({
      include: {
        responses: true,
      },
    })
    // We don't want the SNACKBOT included
    const allUserIds = users
      .filter((user) => user.id !== SNACKBOT_ID)
      .map((user) => user.id)

    // Find all events
    const events = await prisma.event.findMany({
      include: {
        requester: true,
        responses: {
          include: {
            user: true,
          },
        },
      },
    })

    // Filter for upcoming
    const upcomingEvents = events.filter(isUpcoming)

    // Filter for events that still need responses
    const eventsAwaitingResponse = upcomingEvents.filter((event) => {
      return event.responses.length < event.expected
    })

    // DM users we haven't received a response from
    // For each event awaiting response
    const result = await Promise.all(
      eventsAwaitingResponse.map(async (event) => {
        // Find list of users who HAVE responded
        const receivedFrom = event.responses.map((response) => response.userId)
        // Find list of users we still need response from
        const awaitingResponseFrom = allUserIds.filter(
          (id) => !receivedFrom.includes(id)
        )
        // DM those folks
        return await Promise.all(
          awaitingResponseFrom.map(async (userId) => {
            return await requestAvailFromUser(userId, event)
          })
        )
      })
    )

    return res.status(200).send(JSON.stringify(result))
  } catch (e) {
    console.error(e)
    return res.status(500).send(`Error sending reminders: ${e}`)
  }
}
