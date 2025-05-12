import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// TransName Schema
export const transnameSettings = pgTable("transname_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  deadname: text("deadname").notNull(),
  preferredName: text("preferred_name").notNull(),
  oldPronouns: text("old_pronouns").notNull(),
  newPronouns: text("new_pronouns").notNull(),
  customOldPronouns: text("custom_old_pronouns"),
  customNewPronouns: text("custom_new_pronouns"),
  preserveCase: boolean("preserve_case").default(true),
  highlightReplacements: boolean("highlight_replacements").default(true),
  wholeWord: boolean("whole_word").default(true),
  isActive: boolean("is_active").default(true),
  nameReplacements: integer("name_replacements").default(0),
  pronounReplacements: integer("pronoun_replacements").default(0),
});

export const insertTransnameSettingsSchema = createInsertSchema(transnameSettings).omit({
  id: true,
  nameReplacements: true,
  pronounReplacements: true,
});

export type InsertTransnameSettings = z.infer<typeof insertTransnameSettingsSchema>;
export type TransnameSettings = typeof transnameSettings.$inferSelect;
