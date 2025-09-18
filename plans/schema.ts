import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  decimal,
  serial,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Course table
export const courses = pgTable("courses", {
  recordId: varchar("record_id", { length: 50 }).primaryKey(),
  course: text("course").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  units: text("units"), // Comma-separated list of units
  courseSlug: varchar("course_slug", { length: 100 }).notNull(),
  courseUrl: text("course_url"),
  courseAbsolutePath: text("course_absolute_path"),
  shortCourseDescription: text("short_course_description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Unit table
export const units = pgTable("units", {
  recordId: varchar("record_id", { length: 50 }).primaryKey(),
  courseUnit: text("course_unit").notNull(),
  topic: text("topic"),
  description: text("description"),
  order: integer("order").notNull(),
  course: text("course").notNull(),
  exercises: text("exercises"), // Comma-separated list
  courseStatus: varchar("course_status", { length: 20 }),
  unitResources: text("unit_resources"),
  coreReadingTimeMins: integer("core_reading_time_mins").default(0),
  unitStatus: varchar("unit_status", { length: 20 }),
  unitDurationMins: integer("unit_duration_mins"),
  unitUrl: text("unit_url"),
  menuText: text("menu_text"),
  unitNumber: integer("unit_number"),
  numUnitTitle: text("num_unit_title"),
  numCoreResources: integer("num_core_resources").default(0),
  unitPodcast: text("unit_podcast"),
  courseTitle: text("course_title"),
  courseRecordId: varchar("course_record_id", { length: 50 }),
  courseSlug: varchar("course_slug", { length: 100 }),
  courseAbsolutePath: text("course_absolute_path"),
  unitAbsolutePath: text("unit_absolute_path"),
  chunks: text("chunks"), // Comma-separated list of chunks
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Exercise table
export const exercises = pgTable("exercises", {
  recordId: varchar("record_id", { length: 50 }).primaryKey(),
  courseUnitPrompt: text("course_unit_prompt").notNull(),
  title: text("title").notNull(),
  text: text("text"),
  order: integer("order").notNull(),
  unit: text("unit"),
  courseStatus: varchar("course_status", { length: 20 }),
  course: text("course"),
  unitNumber: integer("unit_number"),
  lastModifiedAt: timestamp("last_modified_at"),
  status: varchar("status", { length: 20 }),
  exerciseResponse: text("exercise_response"),
  type: varchar("type", { length: 50 }),
  multipleChoiceOptions: text("multiple_choice_options"),
  answer: text("answer"),
  courseSlug: varchar("course_slug", { length: 100 }),
  courseId: varchar("course_id", { length: 50 }),
  unitId: varchar("unit_id", { length: 50 }),
  chunk: text("chunk"),
  chunkId: varchar("chunk_id", { length: 50 }),
  timeMins: integer("time_mins"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Resource table
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  resource: text("resource").notNull(),
  chunkResource: text("chunk_resource"),
  courses: text("courses"), // Comma-separated list of courses
  year: integer("year"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chunk table
export const chunks = pgTable("chunks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  unit: text("unit"),
  unitUrl: text("unit_url"),
  order: integer("order").notNull(),
  timeMins: integer("time_mins"),
  content: text("content"),
  course: text("course"),
  resources: text("resources"), // Comma-separated list
  exercises: text("exercises"), // Comma-separated list
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chunk-Resource junction table
export const chunkResources = pgTable("chunk_resources", {
  id: serial("id").primaryKey(),
  resourceUnit: text("resource_unit").notNull(),
  url: text("url"),
  timeMins: integer("time_mins"),
  status: varchar("status", { length: 20 }),
  audioUrl: text("audio_url"),
  authors: text("authors"),
  type: varchar("type", { length: 50 }),
  year: integer("year"),
  resourceName: text("resource_name").notNull(),
  order: integer("order").notNull(),
  guide: text("guide"),
  chunk: text("chunk"),
  course: text("course"),
  unit: text("unit"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Export all table types for TypeScript
export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

export type Unit = typeof units.$inferSelect;
export type NewUnit = typeof units.$inferInsert;

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;

export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;

export type Chunk = typeof chunks.$inferSelect;
export type NewChunk = typeof chunks.$inferInsert;

export type ChunkResource = typeof chunkResources.$inferSelect;
export type NewChunkResource = typeof chunkResources.$inferInsert;