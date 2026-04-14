import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const listingAnalytics = pgTable("listing_analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: text("listing_id").notNull(),
  listingName: text("listing_name").notNull().default(""),
  eventType: text("event_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const businessSubmissions = pgTable("business_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerName: text("owner_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  businessName: text("business_name").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull().default(""),
  priceRange: text("price_range"),
  website: text("website"),
  instagram: text("instagram"),
  reason: text("reason"),
  status: text("status").notNull().default("pending"),
  ownerHeadshot: text("owner_headshot"),
  businessPhoto: text("business_photo"),
  servicesOffered: text("services_offered"),
  otherSocialMedia: text("other_social_media"),
  howToContact: text("how_to_contact"),
  contactDetails: text("contact_details"),
  emailSelected: boolean("email_selected").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
