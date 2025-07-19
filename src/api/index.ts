import { PrismaClient } from "@prisma/client"
import type { VercelRequest, VercelResponse } from "@vercel/node"
import type { Show } from "../types"
import {
	deleteCommand,
	discordAPI,
	getInstalledCommands,
	installCommands,
	isValidReq,
} from "../utils/discord"
import {
	getShowData,
	interpretResponse,
	isUpcoming,
	isValidDate,
	isValidLocation,
	logJSON,
} from "../utils/helpers"
import {
	addShowModal,
	availChannelThread,
	availModal,
	availRequestSendMessage,
	basicEphMessage,
	deleteCommandsMenu,
	eventInfoMessage,
	eventSelectMenu,
	removeShowMenu,
	reportBackMessage,
	requestAvailFromUser,
	userSelectMenu,
} from "../utils/messagesAndModals"
import { sanityAPI } from "../utils/sanity"

const prisma = new PrismaClient()
const SNACKBOT_ID = "1059704679677841418"
export const TOTAL_BAND_MEMBERS = 11

export default async function (req: VercelRequest, res: VercelResponse) {
	if (req.method === "POST") {
		// Discord wants to verify requests
		if (!isValidReq(req)) {
			return res.status(401).send({ error: "Bad req signature " })
		}

		const message = req.body

		// Handle verfication "PING" request from Discord
		if (message.type === 1) {
			return res.status(200).send({
				type: 1,
			})
		}

		logJSON(message, `Received request`)
		console.log(`Message type: `, message.type)

		/*
    Slash command listeners

    A lot of these are simple, we just need to respond to a slash command
    request from Discord with a 200 code and whatever content we want the
    bot to display. Some are more complicated and need some data fetching,
    however
    */

		if (message.type === 2) {
			// Test command
			const commandName = message.data.name
			if (commandName === "test") {
				return res.status(200).send({
					...basicEphMessage(`Tested!`),
				})
			}

			// Event Info
			if (commandName === "eventinfo") {
				try {
					const events = await prisma.event.findMany({
						include: { responses: true },
					})
					if (!events) throw new Error(`Couldn't find events`)
					// We only want to see events that are in the future
					const upcomingEvents = events.filter(isUpcoming)
					return res.status(200).send({
						type: 4,
						data: {
							...eventSelectMenu(upcomingEvents),
						},
					})
				} catch (e) {
					console.error(e)
					return res.status(200).send({
						...basicEphMessage(
							`OoOoOps, I messed up trying to find events. Try again or talk to Scott!`,
						),
					})
				}
			}

			// List users
			if (commandName === "listusers") {
				const users = await prisma.user.findMany()
				const userNames = users.map((user) => user.userName)
				return res.status(200).send({
					...basicEphMessage(
						`Here are the users I know about: ${userNames.join(", ")}`,
					),
				})
			}

			// Add user
			if (commandName === "adduser") {
				return res.status(200).send({
					type: 4,
					data: {
						...userSelectMenu,
						flags: 64,
					},
				})
			}

			// Remove user
			if (commandName === "removeuser") {
				return res.status(200).send({
					type: 4,
					data: {
						...userSelectMenu,
						flags: 64,
					},
				})
			}

			// Open availability modal
			if (commandName === "availability") {
				return res.status(200).send({
					type: 9,
					data: {
						...availModal,
					},
				})
			}

			// Open add show modal
			if (commandName === "addshow") {
				return res.status(200).send({
					type: 9,
					data: {
						...addShowModal,
					},
				})
			}

			// Remove show select menu
			if (commandName === "removeshow") {
				// Get list of shows from Sanity to populate list
				const result = await sanityAPI("shows")
				const shows = result.result as Show[]
				logJSON(shows, `Shows in Sanity`)
				return res.status(200).send({
					type: 4,
					data: {
						...removeShowMenu(shows),
						flags: 64,
					},
				})
			}

			// Install commands
			if (commandName === "install") {
				await installCommands()
				return res.status(200).send({
					...basicEphMessage(`I've installed any new commands!`),
				})
			}

			// Delete command
			if (commandName === "delete") {
				// Get list of installed commands
				const commands = await getInstalledCommands()
				console.log(`Installed commands: `, commands)
				// Give user a list of commands to choose from
				if (commands) {
					return res.status(200).send({
						type: 4,
						data: {
							...deleteCommandsMenu(commands),
							flags: 64,
						},
					})
				}
				// If we're here then there are no commands
				return res.status(200).send({
					...basicEphMessage(`There are no commands to delete!`),
				})
			}
		}

		// Message Component Submissions
		if (message.type === 3) {
			// Button Component Submissions
			if (message.data.component_type === 2) {
				// Avail requester confirms or cancels event. Will either DM everyone,
				// or will delete event
				if (message.data.custom_id?.split(":")[0] === "availConfirmSend") {
					// Destructure custom ID into usable components
					const [_, responseValueRaw, eventIdRaw] =
						message.data.custom_id.split(":") as string[]

					const responseValue = responseValueRaw.trim() // Remove whitespace
					const eventId = eventIdRaw.trim() // Remove whitespace

					// Remove whitespace from responseValue and eventId

					// Requester confirms event data, wants to DM everyone
					if (responseValue === "yes" || responseValue === " yes") {
						try {
							if (typeof eventId !== "string") {
								throw new Error(`Event ID needs to be a string`)
							}
							const event = await prisma.event.findUnique({
								where: {
									id: eventId,
								},
								include: {
									requester: true,
								},
							})
							const users = await prisma.user.findMany()
							logJSON(users, "Found these users")
							if (!event || !users)
								throw new Error(`Couldn't find event or users`)
							// DM everyone
							console.log("Messaging users about event: ", event.name)
							const userMessageResults = await Promise.allSettled(
								users.map(async (user) => {
									console.log(`DMing ${user.userName}...`)
									await requestAvailFromUser(user.id, event)
								}),
							)
							console.log(
								`User message results: `,
								JSON.stringify(userMessageResults, null, 2),
							)
							const availsChannel = process.env.AVAILS_CHANNEL_ID ?? ""
							// Create thread in avails channel
							const threadCreationResult = await discordAPI({
								endpoint: `channels/${availsChannel}/threads`,
								method: "POST",
								body: availChannelThread(event),
							})
							console.log(
								`Created thread in availability channel: `,
								threadCreationResult,
							)
							// Confirm with requester
							return res.status(200).send({
								...basicEphMessage(
									`Great, I've asked everyone about ${event.name}. I have also created a thread in the #availabilty channel so people can discuss the event`,
								),
							})
						} catch (e) {
							console.error(e)
							return res
								.status(200)
								.send(
									`Beep boop :( Something went wrong and I couldn't send that message`,
								)
						}
						// User wants to cancel avail request. Delete event in DB
					} else {
						await prisma.event.delete({
							where: {
								id: eventId,
							},
						})

						return res.status(200).send({
							...basicEphMessage(`Ok! I've deleted that event in my brain`),
						})
					}
				}
				// User clicks Yes or No to respond to an availability request
				if (message.data.custom_id.split(":")[0] === "response") {
					try {
						// Get relevant info about the request
						const availability = interpretResponse(message.data.custom_id)
						const userId = message.user.id
						const eventId = message.data.custom_id.split(":")[2]
						const event = await prisma.event.findUnique({
							where: { id: eventId },
							include: {
								responses: { include: { user: true } },
								requester: true,
							},
						})

						if (!userId || !eventId || !event) {
							throw new Error(
								`Couldn't determine event or user ID when recording user's availability response`,
							)
						}

						const { requester, responses, expected } = event
						const botResponse = availability
							? `Great, you're available! Beep boop. I'll let ${requester.userName} know`
							: `Too bad! That's why I exist though. I'll let ${requester.userName} know`
						// Record their response
						await prisma.response.create({
							data: {
								available: availability,
								eventId: eventId,
								userId: userId,
							},
						})
						// If we've heard back from everyone we're expecting to hear back
						// from, report back to even requester
						if (responses.length === expected - 1) {
							const recentResponse = await prisma.response.findUnique({
								where: {
									eventId_userId: {
										eventId: eventId,
										userId: userId,
									},
								},
								include: {
									user: true,
								},
							})
							if (!recentResponse)
								throw Error(`Error finding most recent response`)
							await reportBackMessage(event, recentResponse)
						}
						return res.status(200).send({
							type: 4,
							data: {
								content: botResponse,
							},
						})
					} catch (e) {
						console.error(e)
						return res
							.status(200)
							.send(
								basicEphMessage(
									`Bleep blop I messed up. Or maybe you did! Keep in mind that you can only respond to one of these requests once. Either way, I wasn't able to record that response. Please reach out to the requester or in the availability channel.`,
								),
							)
					}
				}
			}
			// Select Menu Submissions
			const menuName = message.message.interaction?.name

			// Event Info Select Menu Submission
			if (menuName === "eventinfo") {
				try {
					const eventId = message.data.values[0]
					if (typeof eventId !== "string") throw new Error(`Improper event ID`)
					const event = await prisma.event.findUnique({
						where: {
							id: eventId,
						},
						include: {
							responses: {
								include: {
									user: true,
								},
							},
						},
					})
					if (!event) throw new Error(`Error finding event in DB`)
					console.log(`Found event! Sending message...`)
					return res.status(200).send({
						type: 4,
						data: {
							flags: 64,
							content: eventInfoMessage(event),
						},
					})
				} catch (e) {
					console.error(e)
					return res.status(200).send({
						...basicEphMessage(
							`Yikes, I messed up finding info about that event (beep boop)`,
						),
					})
				}
			}

			// Add User Submission
			if (menuName === "adduser") {
				const userId = Object.keys(message.data.resolved.users)[0]
				if (userId === SNACKBOT_ID) {
					return res.status(200).send({
						...basicEphMessage(
							`Bing bong! Please don't add me to the database`,
						),
					})
				}
				const userName = message.data.resolved.users[userId].username
				try {
					console.log(`Adding user to db...`)
					await prisma.user.create({
						data: {
							id: userId,
							userName: userName,
						},
					})
					return res.status(200).send({
						...basicEphMessage(
							`Added user ${userName} to my data banks. Beep boop!`,
						),
					})
				} catch (e) {
					console.error(e)
					return res.status(200).send({
						...basicEphMessage(
							`Something went wrong adding that user! They may already be in my data banks. Try again, and ask Scott if it doesn't work`,
						),
					})
				}
			}

			// Remove User Submission
			if (menuName === "removeuser") {
				const userId = Object.keys(message.data.resolved.users)[0]
				if (userId === SNACKBOT_ID) {
					return res.status(200).send({
						...basicEphMessage(`Bing bong! I'm not even in the database!`),
					})
				}
				const userName = message.data.resolved.users[userId].username
				try {
					console.log(`Removing user from db...`)
					await prisma.user.delete({
						where: {
							id: userId,
						},
					})
					return res.status(200).send({
						...basicEphMessage(
							`Removed user ${userName} from my data banks. Beep boop!`,
						),
					})
				} catch (e) {
					console.error(e)
					return res.status(200).send({
						...basicEphMessage(
							`Something went wrong removing ${userName}! They may not be in my data banks. Try again, and ask Scott if it doesn't work`,
						),
					})
				}
			}

			// Remove Show Menu Submission
			if (menuName === "removeshow") {
				// Get ID of user-selected show to delete
				const showsToRemove = message.data.values
				// Delete in Sanity using ID
				await Promise.allSettled(
					showsToRemove.map(async (showID: string) => {
						await sanityAPI("shows", {
							mutationType: "delete",
							data: { id: showID },
						})
					}),
				)
				const showsDeleted = `${
					showsToRemove.length === 1
						? "one show"
						: `${showsToRemove.length} shows`
				}`
				// Confirm deletion
				return res.status(200).send({
					...basicEphMessage(
						`I removed ${showsDeleted} for you! If you need to undo this, you can still find and restore deleted shows at https://nastysnacks.sanity.studio`,
					),
				})
			}

			// Delete Commands Menu Submission
			if (menuName === "delete") {
				// Get IDs of commands user wants to delete
				logJSON(message, `Received delete command submission`)
				const ids = message.data.values as string[]
				const commandsToDelete = ids.length
				if (commandsToDelete === 0) return res.status(200).send("")
				// For each of those commands, delete it!
				try {
					await Promise.allSettled(
						ids.map(async (id) => {
							return await deleteCommand(id)
						}),
					)
					return res.status(200).send({
						...basicEphMessage(
							`I deleted ${commandsToDelete} command${
								commandsToDelete === 1 ? "" : "s"
							}. If you'd like to reinstall, you can run /install`,
						),
					})
				} catch (e) {
					console.error(e)
					return res.status(200).send({
						...basicEphMessage(
							`Something went wrong trying to delete commands! Try again or hit up Scott`,
						),
					})
				}
			}
		}

		// Modal Submissions
		if (message.type === 5) {
			// Availability Request Modal Submission
			if (message.data.custom_id === "availRequest") {
				const submitted = message.data.components[1].components[0].value
				// We need the dates in a specific format to make sure we can convert them to actual dates
				if (!(typeof submitted === "string") || !isValidDate(submitted)) {
					return res.status(200).send({
						...basicEphMessage(
							`Sorry, I couldn't understand the date you asked me about. Please ask me to check dates in exactly this format: "YYYY-MM-DD". The date you submitted was: ${submitted}`,
						),
					})
				}
				// Now that we know we can work with the data, let's grab it and do stuff
				const eventDate = new Date(`${submitted}T00:00:00-06:00`)
				if (eventDate < new Date()) {
					return res.status(200).send({
						...basicEphMessage(
							`Sorry, I can't check availability for dates that have already passed. The date you submitted was: ${submitted}`,
						),
					})
				}
				const eventName = message.data.components[0].components[0].value
				const requesterId = message.member.user.id as string
				try {
					// Add event to DB
					const event = await prisma.event.create({
						data: {
							date: eventDate,
							name: eventName,
							userId: requesterId,
							expected: TOTAL_BAND_MEMBERS,
						},
					})
					// Send message to user confirming event details, and prompting them
					// to DM everyone
					return res.status(200).send({
						type: 4,
						data: {
							...availRequestSendMessage(event),
						},
					})
				} catch (e) {
					console.error(e)
					return res.status(200).send({
						...basicEphMessage(
							`Something went wrong, I can't remember anything about that event you just told me about! Try again, and if it doesn't work then talk to Scott`,
						),
					})
				}
			}

			// Add Show Modal Submission
			if (message.data.custom_id === "addShow") {
				const dateString = message.data.components[2].components[0].value
				const location = message.data.components[3].components[0].value
				// Check date and ask for new one if no good
				if (!(typeof dateString === "string") || !isValidDate(dateString)) {
					return res.status(200).send({
						...basicEphMessage(
							`Sorry, I couldn't understand the date you asked me about. Please ask me to check dates in exactly this format: "YYYY-MM-DD". The date you submitted was: ${dateString}`,
						),
					})
				} else if (typeof location !== "string" || !isValidLocation(location)) {
					return res.status(200).send({
						...basicEphMessage(
							`Sorry, I don't know where ${location} is. I can only understand locations if they contain a city name and a state code (e.g. Chicago, IL)`,
						),
					})
				}
				const showData = getShowData(message)
				try {
					await sanityAPI("shows", {
						mutationType: "create",
						data: {
							...showData,
						},
					})
					return res.status(200).send({
						...basicEphMessage(
							`Beep Boop! I just added that show to the website. Check it out at https://nastysnacks.com/#shows`,
						),
					})
				} catch (e) {
					console.error(e)
					return res.status(200).send({
						...basicEphMessage(
							`Something went wrong adding that show to the website! You can try again, or visit https://nastysnacks.sanity.studio to add a show.`,
						),
					})
				}
			}
		}
	}

	return res.status(200).send("")
}
