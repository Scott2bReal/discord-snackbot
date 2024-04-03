import { relations } from "drizzle-orm"
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core"

export const prismaMigrations = pgTable("_prisma_migrations", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  checksum: varchar("checksum", { length: 64 }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true, mode: "string" }),
  migrationName: varchar("migration_name", { length: 255 }).notNull(),
  logs: text("logs"),
  rolledBackAt: timestamp("rolled_back_at", {
    withTimezone: true,
    mode: "string",
  }),
  startedAt: timestamp("started_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
})

export const user = pgTable("User", {
  id: text("id").primaryKey().notNull(),
  userName: text("userName").notNull(),
})

export type SelectUser = typeof user.$inferSelect

export const userRelations = relations(user, ({ many }) => ({
  events: many(event),
  responses: many(response),
}))

export const event = pgTable("Event", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  date: timestamp("date", { precision: 3, mode: "string" }).notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
  expected: integer("expected").notNull(),
})

export type SelectEvent = typeof event.$inferSelect
export type InsertEvent = typeof event.$inferInsert

export const eventRelations = relations(event, ({ one, many }) => ({
  requester: one(user, {
    fields: [event.userId],
    references: [user.id],
  }),
  responses: many(response),
}))

export const response = pgTable(
  "Response",
  {
    id: text("id").primaryKey().notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    available: boolean("available").notNull(),
    eventId: text("eventId")
      .notNull()
      .references(() => event.id, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (table) => {
    return {
      eventIdUserIdKey: uniqueIndex("Response_eventId_userId_key").on(
        table.userId,
        table.eventId,
      ),
    }
  },
)

export type SelectResponse = typeof response.$inferSelect
export type InsertResponse = typeof response.$inferInsert

export const responseRelations = relations(response, ({ one }) => ({
  user: one(user, {
    fields: [response.userId],
    references: [user.id],
  }),
  event: one(event),
}))
