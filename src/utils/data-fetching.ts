import { db } from "../drizzle/db"
import { SelectEvent, SelectResponse, SelectUser } from "../drizzle/schema"

type EventWithResponses = SelectEvent & {
  responses: Array<SelectResponse & { user: SelectUser }>
  requester: SelectUser
}

export async function getEventWithResponses(
  eventId: string,
): Promise<EventWithResponses | undefined> {
  return await db.query.event.findFirst({
    where: (event, { eq }) => eq(event.id, eventId),
    with: {
      responses: {
        with: {
          user: true,
        },
      },
      requester: true,
    },
  })
}
