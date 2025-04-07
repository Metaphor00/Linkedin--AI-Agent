import { pgTable, text, serial, integer, boolean, timestamp, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  linkedinAccessToken: text("linkedin_access_token"),
  linkedinRefreshToken: text("linkedin_refresh_token"),
  linkedinTokenExpiry: timestamp("linkedin_token_expiry"),
  writingStyleSamples: text("writing_style_samples"),
  defaultTone: text("default_tone").default("professional"),
  analyzePostsByDefault: boolean("analyze_posts_by_default").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Post schema
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  images: jsonb("images").$type<string[]>(),
  status: text("status").notNull().default("draft"), // draft, scheduled, published
  eventDate: timestamp("event_date"),
  eventLocation: text("event_location"),
  eventDescription: text("event_description"),
  peopleMetConnections: text("people_met_connections"),
  tonePreference: text("tone_preference"),
  scheduleDate: timestamp("schedule_date"),
  publishedDate: timestamp("published_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Post generation history schema
export const postGenerations = pgTable("post_generations", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  generatedContent: text("generated_content").notNull(),
  aiPrompt: text("ai_prompt"),
  hashtags: jsonb("hashtags").$type<string[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPostGenerationSchema = createInsertSchema(postGenerations).omit({
  id: true,
  createdAt: true,
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type PostGeneration = typeof postGenerations.$inferSelect;
export type InsertPostGeneration = z.infer<typeof insertPostGenerationSchema>;

// Event details for creating a post
export const eventDetailsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().optional(),
  location: z.string().optional(),
  description: z.string().min(10, "Please provide a detailed description"),
  connections: z.string().optional(),
  images: z.array(z.string()).optional(),
  tonePreference: z.string().optional().default("professional"),
  analyzeStyle: z.boolean().optional().default(true),
});

export type EventDetails = z.infer<typeof eventDetailsSchema>;

// Generated post schema
export const generatedPostSchema = z.object({
  content: z.string(),
  hashtags: z.array(z.string()).optional(),
});

export type GeneratedPost = z.infer<typeof generatedPostSchema>;
