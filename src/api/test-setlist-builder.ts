import { VercelRequest, VercelResponse } from "@vercel/node";

const secretKey = process.env.SETLIST_BUILDER_SECRET;

export default async function (req: VercelRequest, res: VercelResponse) {
	const { authorization } = req.headers;
	if (!(authorization?.split(" ")[1] === secretKey)) {
		return res.status(401).send("Unauthorized");
	}

	if (req.method === "GET") {
		console.log("Test Setlist Builder GET request received");
		return res.status(200).send("Hello");
	}

	if (req.method === "POST") {
		const { message } = req.body;
		console.log(`Received message: ${JSON.stringify(message, null, 2)}`);
		return res.status(200).send(`You said: ${message}`);
	}
}
