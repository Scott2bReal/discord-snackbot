import { Show } from '../types'
import { Event, prisma, Response, User } from '@prisma/client'
import { INSTALL_ID } from './commands'
import { discordAPI } from './discord'

export const availModal = {
  custom_id: 'availRequest',
  title: 'Availability',
  components: [
    {
      type: 1,
      components: [
        {
          type: 4,
          custom_id: 'eventName',
          label: 'Event Name',
          style: 1,
        },
      ],
    },
    {
      type: 1,
      components: [
        {
          type: 4,
          custom_id: 'date',
          label: 'Date (please input as YYYY-MM-DD)',
          placeholder: '2022-12-31',
          style: 1,
        },
      ],
    },
  ],
}

export const addShowModal = {
  custom_id: 'addShow',
  title: 'Add Show',
  components: [
    {
      type: 1,
      components: [
        {
          type: 4,
          custom_id: 'venueName',
          label: 'Venue Name',
          style: 1,
        },
      ],
    },
    {
      type: 1,
      components: [
        {
          type: 4,
          custom_id: 'subtitle',
          label: 'Subtitle',
          style: 1,
          required: false,
        },
      ],
    },
    {
      type: 1,
      components: [
        {
          type: 4,
          custom_id: 'date',
          label: 'Date (please enter in format YYYY-MM-DD)',
          style: 1,
          required: false,
        },
      ],
    },
    {
      type: 1,
      components: [
        {
          type: 4,
          custom_id: 'location',
          label: 'Location (enter like "Chicago, IL)',
          style: 1,
        },
      ],
    },
    {
      type: 1,
      components: [
        {
          type: 4,
          custom_id: 'ticketLink',
          label: 'Ticket Link',
          style: 1,
          required: false,
        },
      ],
    },
  ],
}

export const removeShowMenu = (shows: Show[]) => {
  return {
    content: 'Pick up to 3 shows to remove',
    custom_id: 'removeShow',
    components: [
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: 'removeShow',
            options: shows.map((show) => {
              const showDate = show.date ? ` - ${show.date}` : ''
              return {
                label: show.venueName,
                value: show._id,
                description: `${show.city}, ${show.state}${showDate}`,
              }
            }),
            placeholder: 'Pick a show to delete',
            max_values: 3,
          },
        ],
      },
    ],
  }
}

export const deleteCommandsMenu = (commands: Array<any>) => {
  return {
    content: 'Select the commands you would like to delete',
    components: [
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: 'deleteCommandsMenu',
            options: commands
              .filter((command) => command.id !== INSTALL_ID)
              .map((command) => {
                return {
                  label: command.name,
                  value: command.id,
                  description: command.description,
                }
              }),
            max_values: 3,
          },
        ],
      },
    ],
  }
}

export const userSelectMenu = {
  content: 'Select a user',
  components: [
    {
      type: 1,
      components: [
        {
          type: 5,
          custom_id: 'userSelectMenu',
        },
      ],
    },
  ],
}

export const eventSelectMenu = (
  events: (Event & { responses: Response[] })[]
) => {
  return events.length === 0
    ? {
        content: `Beep boop! I don't know about any upcoming events...`,
        flags: 64,
      }
    : {
        content: `Beep boop here are the events I know about. Pick one and I'll tell you more about it`,
        flags: 64,
        components: [
          {
            type: 1,
            components: [
              {
                type: 3,
                custom_id: 'selectedEvent',
                options: events.map((event) => {
                  return {
                    label: `${event.name} (${event.responses.length} responses)`,
                    value: event.id,
                    description: event.date.toDateString(),
                  }
                }),
              },
            ],
          },
        ],
      }
}

export const availRequestSendMessage = (event: Event) => {
  // This function takes the event as an argument so we can embed the event ID
  // in the custom_id property of the component that gets passed along through
  // HTTP. We'll use the portion of the custom_id before the : to identify the
  // submission, and the use the event ID to send out DMs
  return {
    content: `Beep boop! I've saved that event in my brain. Just to confirm, the event deets are:\n\nEvent name: ${
      event.name
    }\nEvent date: ${event.date.toDateString()}\n\nIf that looks good, click this button and I'll hit everyone up for their availability!`,
    flags: 64,
    components: [
      {
        type: 1,
        components: [
          {
            custom_id: `availConfirmSend:${event.id}`,
            // Button
            type: 2,
            // Primary button style
            style: 1,
            label: `Confirm`,
          },
        ],
      },
    ],
  }
}

export const eventInfoMessage = (
  event: Event & { responses: (Response & { user: User })[] }
) => {
  const responseList = event.responses.map((response) => {
    return `\n${response.user.userName}: ${
      response.available ? 'Available' : 'Not available'
    }`
  })

  return `${
    event.name
  }: ${event.date.toDateString()}\nResponses:${responseList}`
}

export const basicEphMessage = (content: string) => {
  return {
    type: 4,
    data: {
      flags: 64,
      content: content,
    },
  }
}

// We're using the custom_id field here to identify the type of submission,
// record the user's response, and pass along the event ID. The bot will
// respond to this by creating a new response and associating it with the
// user and event
export async function requestAvailFromUser(
  userId: string,
  event: Event & { requester: User }
) {
  const channel = await discordAPI('users/@me/channels', 'POST', {
    recipient_id: userId,
  })

  return await discordAPI(`channels/${channel.id}/messages`, 'POST', {
    content: `BEEP BOOP ${
      event.requester.userName
    } wants to know if you're available for ${
      event.name
    } on ${event.date.toDateString()}?`,
    components: [
      {
        type: 1,
        components: [
          {
            custom_id: `response:yes:${event.id}`,
            // Button
            type: 2,
            // Success (green) button style
            style: 3,
            label: `Yes`,
          },
          {
            custom_id: `response:no:${event.id}`,
            // Button
            type: 2,
            // Success (green) button style
            style: 4,
            label: `No`,
          },
        ],
      },
    ],
  })
}
