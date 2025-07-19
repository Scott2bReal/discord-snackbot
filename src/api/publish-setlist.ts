import type { VercelRequest, VercelResponse } from "@vercel/node"
import type { Setlist } from "../types"
import { discordAPI } from "../utils/discord"
import {
	setlistChannelThread,
	setlistChannelThreadMessage,
} from "../utils/messagesAndModals"

const secretKey = process.env.SETLIST_BUILDER_SECRET
const setlistChannel = process.env.SETLIST_CHANNEL_ID

export default async function (req: VercelRequest, res: VercelResponse) {
	if (req.headers.authorization?.split(" ")[1] !== secretKey) {
		return res.status(401).json({ error: "Unauthorized" })
	}

	if (req.method === "POST") {
		try {
			const { setlist: setlistString, link } = req.body
			const setlist = JSON.parse(setlistString) as Setlist

			if (setlist.discordThreadId && setlist.discordMessageId) {
				// Update existing message
				console.log("Setlist already published, updating existing message")

				const messageResult = await discordAPI({
					endpoint: `channels/${setlist.discordThreadId}/messages/${setlist.discordMessageId}`,
					method: "PATCH",
					body: setlistChannelThreadMessage(setlist, link),
				})

				console.log("Updated setlist message:", messageResult)

				return res.status(200).json({
					message: "Updated setlist",
					threadId: setlist.discordThreadId,
					messageId: setlist.discordMessageId,
				})
			}

			// Create new thread and message
			console.log("Publishing new setlist:", setlistString)

			const threadResult = await discordAPI({
				endpoint: `channels/${setlistChannel}/threads`,
				method: "POST",
				body: setlistChannelThread(setlist),
			})

			console.log("Thread creation result:", threadResult)

			if (!threadResult.id) {
				throw new Error("Failed to create thread - no ID returned")
			}

			console.log("Created thread:", threadResult)
			const threadId = threadResult.id

			const messageResult = await discordAPI({
				endpoint: `channels/${threadId}/messages`,
				method: "POST",
				body: setlistChannelThreadMessage(setlist, link),
			})

			if (!messageResult.id) {
				throw new Error("Failed to send message - no ID returned")
			}

			console.log("Published setlist message:", messageResult)

			return res.status(200).json({
				message: "Published setlist",
				threadId: threadId,
				messageId: messageResult.id,
			})
		} catch (error) {
			console.error("Error processing setlist:", error)
			return res.status(500).json({
				error: "Failed to process setlist",
				details: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	return res.status(405).json({ error: "Method Not Allowed" })
}
