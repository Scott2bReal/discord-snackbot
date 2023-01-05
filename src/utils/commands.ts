// ID of install command - included to omit from delete commands menu
export const INSTALL_ID = '1060197765365387334'

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
  },
  listusers: {
    name: 'listusers',
    description: 'List users in database',
    type: 1,
  },
  adduser: {
    name: 'adduser',
    description: 'Add user to the database',
    type: 1,
  },
  listevents: {
    name: 'listevents',
    description: 'List events in the database',
    type: 1,
  },
  eventinfo: {
    name: 'eventinfo',
    description: `View detailsl for a specific event`,
    type: 1,
  }
}
