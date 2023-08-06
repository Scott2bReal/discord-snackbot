import { VercelRequest, VercelResponse } from "@vercel/node"
import {
  contactFormMessage,
  sendBasicMessage,
} from "../utils/messagesAndModals"

export interface ContactFormData {
  firstName: string
  lastName: string | undefined
  email: string
  subject: string
  message: string
  secret: string
}

const isContactFormData = (data: any): data is ContactFormData => {
  return (
    typeof data.firstName === "string" &&
    typeof data.lastName === "string" &&
    typeof data.email === "string" &&
    typeof data.subject === "string" &&
    typeof data.message === "string" &&
    typeof data.secret === "string"
  )
}

const secretKey = process.env.CONTACT_FORM_SECRET ?? ""
const generalChannelId = process.env.GENERAL_CHANNEL_ID ?? ""

export default async function (req: VercelRequest, res: VercelResponse) {
  try {
    if (!(req.method === "POST")) {
      return res.status(405).send("Method not allowed")
    }
    const data = JSON.parse(req.body)
    console.log(
      `Received request for handling contact form from website: ${JSON.stringify(
        data,
      )}`,
    )
    if (!isContactFormData(data)) {
      console.log(`Invalid data`)
      return res.status(400).send("Invalid data")
    }
    const { firstName, lastName, email, subject, message, secret } = data
    if (secret !== secretKey) {
      console.log(`Unauthorized request`)
      return res.status(401).send("Unauthorized")
    }
    const result = await sendBasicMessage(
      contactFormMessage({ firstName, lastName, email, subject, message }),
      generalChannelId,
    )
    console.log(`Sent message to general channel: ${result}`)
    return res.status(200).send("Notified the band")
  } catch (e) {
    console.error(e)
    return res.status(500).send("Internal server error")
  }
}
