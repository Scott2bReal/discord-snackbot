export type ApplicationCommand = {
  id: string
  application_id: string
  version: string
  default_permission: boolean
  default_member_permissions: any
  type: number
  nsfw: boolean
  name: string
  description: string
  guild_id: string
}

export type GuildMember = {
  avatar: string | null
  communication_disabled_until: string | null
  flags: number
  is_pending: boolean
  joined_at: string
  nick: null
  pending: boolean
  premium_since: string | null
  roles: string[]
  user: User
  mute: boolean
  deaf: boolean
}

export type User = {
  id: string
  username: string
  avatar: string
  avatar_decoration: string | null
  discriminator: string
  public_flags: number
}

export type Show = {
  _id?: string
  venueName: string
  subtitle?: string
  date?: string
  city: string
  state: string
  ticketLink?: string
  description?: string
}

export type DiscordMessage = {
  id: string
  type: number
  content: string
  channel_id: string
  author: User
  attachments: any[]
  embeds: any[]
  mentions: any[]
  mention_roles: any[]
  pinned: boolean
  mention_everyone: boolean
  tts: boolean
  timestamp: string
  edited_timestamp: string | null
  flags: number
  components: any[]
  referenced_message: DiscordMessage | null
}
