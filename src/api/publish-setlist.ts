import type { VercelRequest, VercelResponse } from "@vercel/node"
import { discordAPI } from "../utils/discord"
import {
	setlistChannelThread,
	setlistChannelThreadMessage,
} from "../utils/messagesAndModals"
import { Setlist } from "../types"

const secretKey = process.env.SETLIST_BUILDER_SECRET
const setlistChannel = process.env.SETLIST_CHANNEL_ID

export default async function (req: VercelRequest, res: VercelResponse) {
	if (req.headers.authorization?.split(" ")[1] !== secretKey) {
		return res.status(401).send("Unauthorized")
	}

	if (req.method === "POST") {
		const { setlist: setlistString, link } = req.body
		const setlist = JSON.parse(setlistString) as Setlist

		console.log("Publishing setlist:", setlistString)

		const result = await discordAPI({
			endpoint: `channels/${setlistChannel}/threads`,
			method: "POST",
			body: setlistChannelThread(setlist),
		})

		console.log("Published setlist:", result)

		const threadId = result.id

		const messageResult = await discordAPI({
			endpoint: `channels/${threadId}/messages`,
			method: "POST",
			body: setlistChannelThreadMessage(setlist, link),
		})

		console.log("Published setlist message:", messageResult)

		return res.status(200).send(`Published setlist`)
	}

	return res.status(405).send("Method Not Allowed")
}
