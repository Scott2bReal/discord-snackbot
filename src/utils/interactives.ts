import { Show } from '../types'
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