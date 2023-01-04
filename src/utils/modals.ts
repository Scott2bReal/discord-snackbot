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

export const removeShowMenu = {
  content: 'Pick a show to remove',
  components: [
    {
      type: 1,
      components: [
        {
          type: 3,
          custom_id: 'class_select_1',
          options: [
            {
              label: 'Rogue',
              value: 'rogue',
              description: 'Sneak n stab',
              emoji: {
                name: 'rogue',
                id: '625891304148303894',
              },
            },
            {
              label: 'Mage',
              value: 'mage',
              description: "Turn 'em into a sheep",
              emoji: {
                name: 'mage',
                id: '625891304081063986',
              },
            },
            {
              label: 'Priest',
              value: 'priest',
              description: "You get heals when I'm done doing damage",
              emoji: {
                name: 'priest',
                id: '625891303795982337',
              },
            },
          ],
          placeholder: 'Choose a class',
          min_values: 1,
          max_values: 3,
        },
      ],
    },
  ],
}
