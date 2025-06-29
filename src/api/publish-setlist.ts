import type { VercelRequest, VercelResponse } from "@vercel/node"

const secretKey = process.env.SETLIST_BUILDER_SECRET

export default async function (req: VercelRequest, res: VercelResponse) {
	if (req.headers.authorization?.split(" ")[1] !== secretKey) {
		return res.status(401).send("Unauthorized")
	}

	if (req.method === "POST") {
		const { setlist } = req.body
		console.log(`Received setlist: ${JSON.stringify(setlist, null, 2)}`)
		return res.status(200).send(`You said: ${setlist}`)
	}

	return res.status(405).send("Method Not Allowed")
}
