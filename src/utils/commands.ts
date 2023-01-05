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
  removeshow: {
    name: 'removeshow',
    description: 'Remove a show from the website',
    type: 1,
  },
  install: {
    name: 'install',
    description: 'Install any new commands',
    type: 1,
  },
  delete: {
    name: 'delete',
    description: 'Delete a command',
    type: 1,
  }
}

export const INSTALL_ID = '1060197765365387334'
