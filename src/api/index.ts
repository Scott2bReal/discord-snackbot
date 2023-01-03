import { VercelRequest, VercelResponse } from "@vercel/node";
import { logJSON } from "../utils/loggers";

export default function (req: VercelRequest, res: VercelResponse) {
  logJSON(req.body, `Request body: `)
  return res.status(200).send('')
}
