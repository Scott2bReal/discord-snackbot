export type ApplicationCommand = {
  id: string
  application_id: string
  version: string
  default_permission: boolean
  default_member_permissions:any
  type: number
  nsfw: boolean
  name: string
  description: string
  guild_id: string
}
