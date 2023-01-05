import { Show } from '../types'
import { Event, Response, User } from '@prisma/client'
import { INSTALL_ID } from './commands'

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
          label: 'Date (please input this format)',
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

export const eventSelectMenu = (events: Event[]) => {
  return {
    content: `Beep boop here are the events I know about. Pick one and I'll tell you more about it`,
    components: [
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: 'selectedEvent',
            options: events.map((event) => {
              return {
                label: event.name,
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
    content: `Beep boop! I've saved that event in my brain. Just to confirm, the event deets are:\nEvent Name: ${event.name}\nEvent Date: ${event.date.toDateString()}\nIf that looks good, click this button and I'll hit everyone up for their availabily!`,
    flags: 64,
    components: [
      {
        type: 1,
        custom_id: `availConfirmSend:${event.id}`,
        components: [
          {
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
