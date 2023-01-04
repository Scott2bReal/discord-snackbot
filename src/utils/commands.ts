// List of commands which will be registered with the server
export const COMMANDS: { [commandName: string]: any } = {
  test: {
    name: 'test',
    description: 'Test slash command',
    type: 1,
  },
  availability: {
    name: 'availability',
    description: 'Request availabilities',
    type: 1,
  },
  addshow: {
    name: 'addshow',
    description: 'Add a show to the website',
    type: 1,
  },
}
