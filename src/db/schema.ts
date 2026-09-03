import { jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const enquirySource = pgEnum("enquiry_source", ["booking", "contact"]);

export type Attachment = {
  name: string;
  size: number;
  type: string;
  url?: string;
  /** Blob pathname (enquiries/<id>/<file>), used to stream private blobs via the site. */
  pathname?: string;
};

export const enquiries = pgTable("enquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email").notNull(),
  ideas: text("ideas"),
  source: enquirySource("source").notNull(),
  attachments: jsonb("attachments").$type<Attachment[]>().notNull().default([]),
  /** When the notification email was sent (null until the booking modal's final step). */
  notifiedAt: timestamp("notified_at", { withTimezone: true }),
});

export type Enquiry = typeof enquiries.$inferSelect;
export type NewEnquiry = typeof enquiries.$inferInsert;
