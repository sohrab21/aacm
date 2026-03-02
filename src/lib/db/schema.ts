import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userEmail: varchar("user_email", { length: 255 }).notNull(),
    contentType: varchar("content_type", { length: 100 }).notNull(),
    reviewMode: varchar("review_mode", { length: 50 }).notNull(),
    draft: text("draft").notNull(),
    context: text("context").default(""),
    review: text("review").notNull(),
    rating: integer("rating"),
    overrideRating: integer("override_rating"),
    overrideNotes: text("override_notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("reviews_user_email_idx").on(table.userEmail),
    index("reviews_created_at_idx").on(table.createdAt),
  ]
);
