import { pgTable, text, timestamp, integer, pgEnum, uuid, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ==================== ENUMS ====================
// Based on actual CSV data analysis:
export const courseStatusEnum = pgEnum('course_status', ['Active']); // CSV field: "Status" - Real example: "Active"
export const resourceTypeEnum = pgEnum('resource_type', ['Article', 'Blog', 'Paper', 'Website']); // CSV field: "[>] Type" - Real examples: "Article", "Blog", "Paper", "Website"
export const resourceStatusEnum = pgEnum('resource_status', ['Core', 'Maybe', 'Supplementary', 'Optional']); // CSV field: "Status" - Real examples: "Core", "Maybe" + added: "Supplementary", "Optional"
// Removed exerciseTypeEnum - exercise type is plain text. CSV field: "Type" - Real example: "Free text"

// ==================== TABLES ====================

/**
 * Courses - Top-level educational programs
 */
export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // CSV field: "Course" - Real example: "AGI Strategy"
  slug: text('slug').notNull().unique(), // CSV field: "Course slug" - Real example: "agi-strategy"
  description: text('description'), // CSV field: "Short course description" - Real example: "Learn how to navigate humanity's most critical decade."
  status: courseStatusEnum('status').notNull().default('Active'), // CSV field: "Status" - Real example: "Active"
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Units - Major sections within a course
 */
export const units = pgTable('units', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), // CSV field: "Topic" - Real example: "Racing to a Better Future"
  order: integer('order').notNull(), // CSV field: "Order" - Order in which to display the units
  duration: integer('duration'), // CSV field: "Unit duration (mins)" - Real example: 110
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Chunks - Individual content pieces within a unit
 */
export const chunks = pgTable('chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  unitId: uuid('unit_id').notNull().references(() => units.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), // CSV field: "[>] Chunks" - Real example: "Imagining a better future", "Intelligence explosion"
  content: text('content'), // Markdown text content, real example: "You're the product of 8,000 generations of humans..."
  order: integer('order').notNull(), // CSV field: "Order" - Real example: 1, 2, 3, 4
  timeMinutes: integer('time_minutes'), // Real example: 50, 45, 20, 25, 75
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Resources - External learning materials linked to chunks
 */
export const resources = pgTable('resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  chunkId: uuid('chunk_id').notNull().references(() => chunks.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), // CSV field: "[>] Resource name" - Real example: "Seeking Stability in the Competition for AI Advantage"
  url: text('url').notNull(), // CSV field: "[>] URL" - Real example: "https://www.rand.org/pubs/commentary/2025/03/seeking-stability..."
  author: text('author'), // CSV field: "[>] Authors" - Real example: "Rehman, Mueller, and Mazarr"
  year: integer('year'), // CSV field: "[>] Year" - Real example: 2025, 2024, 2023
  type: resourceTypeEnum('type').notNull(), // CSV field: "[>] Type" - Real example: "Article", "Blog", "Website"
  timeMinutes: integer('time_minutes'), // CSV field: "Time (mins)" - Real example: 15, 30, 10
  description: text('description'), // CSV field: "Guide" - Real example: "This RAND article describes some of the international dynamics..."
  order: integer('order').notNull(), // CSV field: "Order" - Real example: 1, 2, 3
  status: resourceStatusEnum('status').notNull().default('Core'), // CSV field: "Status" - Real example: "Core"
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Exercises - Interactive learning activities within chunks
 */
export const exercises = pgTable('exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  chunkId: uuid('chunk_id').notNull().references(() => chunks.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), // CSV field: "Title" - Real example: "What does a better future for yourself look like?"
  content: text('content').notNull(), // CSV field: "[h] Text" - Real example: "In so many ways, human lives have been transformed..."
  type: text('type').notNull(), // CSV field: "Type" - Real example: "Free text" (plain text, not enum)
  timeMinutes: integer('time_minutes'), // CSV field: "Time (mins)" - Real example: 10, 15, 20, 30
  order: integer('order').notNull(), // CSV field: "Order" - Real example: 1, 2, 3
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ==================== RELATIONS ====================

export const coursesRelations = relations(courses, ({ many }) => ({
  units: many(units),
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
  course: one(courses, {
    fields: [units.courseId],
    references: [courses.id],
  }),
  chunks: many(chunks),
}));

export const chunksRelations = relations(chunks, ({ one, many }) => ({
  unit: one(units, {
    fields: [chunks.unitId],
    references: [units.id],
  }),
  resources: many(resources),
  exercises: many(exercises),
}));

export const resourcesRelations = relations(resources, ({ one }) => ({
  chunk: one(chunks, {
    fields: [resources.chunkId],
    references: [chunks.id],
  }),
}));

export const exercisesRelations = relations(exercises, ({ one }) => ({
  chunk: one(chunks, {
    fields: [exercises.chunkId],
    references: [chunks.id],
  }),
}));

// ==================== TYPE EXPORTS ====================

import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Select types (for reading from database)
export type Course = InferSelectModel<typeof courses>;
export type Unit = InferSelectModel<typeof units>;
export type Chunk = InferSelectModel<typeof chunks>;
export type Resource = InferSelectModel<typeof resources>;
export type Exercise = InferSelectModel<typeof exercises>;

// Insert types (for creating new records)
export type NewCourse = InferInsertModel<typeof courses>;
export type NewUnit = InferInsertModel<typeof units>;
export type NewChunk = InferInsertModel<typeof chunks>;
export type NewResource = InferInsertModel<typeof resources>;
export type NewExercise = InferInsertModel<typeof exercises>;

// Types with relations
export type CourseWithUnits = Course & {
  units: Unit[];
};

export type UnitWithChunks = Unit & {
  chunks: Chunk[];
};

export type ChunkWithContent = Chunk & {
  resources: Resource[];
  exercises: Exercise[];
};

export type CourseWithFullContent = Course & {
  units: (Unit & {
    chunks: (Chunk & {
      resources: Resource[];
      exercises: Exercise[];
    })[];
  })[];
};