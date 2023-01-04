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
