import { InteractionResponseType, InteractionType, MessageComponentTypes } from "discord-interactions";

// List of commands which will be registered with the server
export const COMMANDS: { [commandName: string]: any } = {
  test: {
    name: 'test',
    description: 'Test slash command',
    type: 1,
  },
  // availability: {
  //   name: 'availability',
  //   description: 'Request availabilities',
  //   type: 1,
  // }
}
