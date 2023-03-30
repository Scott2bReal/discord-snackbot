import { VercelRequest, VercelResponse } from "@vercel/node";
import { Kysely } from "kysely";
import { PlanetScaleDialect } from "kysely-planetscale";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/mysql";
import { Database } from ".";
import { isUpcoming } from "../utils/helpers";
import { requestAvailFromUser } from "../utils/messagesAndModals";

const SNACKBOT_ID = "1059704679677841418";
const db = new Kysely<Database>({
  dialect: new PlanetScaleDialect({
    url: process.env.PLANETSCALE_DB_URL,
  }),
});

export default async function (req: VercelRequest, res: VercelResponse) {
  try {
    // Find all users
    const users = await db
      .selectFrom("user")
      .selectAll("user")
      .select((eb) => [
        jsonArrayFrom(
          eb
            .selectFrom("response")
            .selectAll("response")
            .whereRef("response.user_id", "=", "user.id")
        ).as("responses"),
      ])
      .execute();
    // const users = await prisma.user.findMany({
    //   include: {
    //     responses: true,
    //   },
    // })
    // We don't want the SNACKBOT included
    const allUserIds = users
      .filter((user) => user.discord_id !== SNACKBOT_ID)
      .map((user) => {
        return { userId: user.id, discordId: user.discord_id };
      });

    // Find all events
    // const events = await prisma.event.findMany({
    //   include: {
    //     requester: true,
    //     responses: {
    //       include: {
    //         user: true,
    //       },
    //     },
    //   },
    // })
    const events = await db
      .selectFrom("event")
      .selectAll("event")
      .select((eb) => [
        jsonObjectFrom(
          eb
            .selectFrom("user")
            .selectAll("user")
            .whereRef("user.id", "=", "event.user_id")
        ).as("requester"),
      ])
      .select((eb) => [
        jsonArrayFrom(
          eb
            .selectFrom("response")
            .innerJoin("user", "user.id", "response.user_id")
            .selectAll("response")
            .select(["user.userName as userName"])
            .whereRef("response.event_id", "=", "event.id")
        ).as("responses"),
      ])
      .execute();
    // Filter for upcoming
    const upcomingEvents = events.filter(isUpcoming);

    // Filter for events that still need responses
    const eventsAwaitingResponse = upcomingEvents.filter((event) => {
      return event.responses.length < event.expected_responses;
    });

    // DM users we haven't received a response from
    // For each event awaiting response
    const result = await Promise.all(
      eventsAwaitingResponse.map(async (event) => {
        // Find list of users who HAVE responded
        const receivedFrom = event.responses.map((response) => response.user_id);
        // Find list of users we still need response from
        const awaitingResponseFrom = allUserIds.filter(
          (user) => !receivedFrom.includes(user.userId)
        );
        // DM those folks
        return await Promise.all(
          awaitingResponseFrom.map(async (user) => {
            const eventData = {
              date: event.date,
              id: event.id,
              name: event.name,
              user_id: event.user_id,
              expected_responses: event.expected_responses,
              requesterName: event.requester.userName,
            }
            return await requestAvailFromUser(user.discordId, eventData);
          })
        );
      })
    );

    return res.status(200).send(JSON.stringify(result));
  } catch (e) {
    console.error(e);
    return res.status(500).send(`Error sending reminders: ${e}`);
  }
}
