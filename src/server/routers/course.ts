import { z } from 'zod';
import { router, procedure } from '../trpc';
import { courses, units, exercises } from '@/db/schema';
import { eq, like } from 'drizzle-orm';

export const courseRouter = router({
  // Get all courses
  getAll: procedure.query(async ({ ctx }) => {
    return ctx.db.select().from(courses);
  }),

  // Get course by record ID
  getById: procedure
    .input(z.object({ recordId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [course] = await ctx.db
        .select()
        .from(courses)
        .where(eq(courses.recordId, input.recordId));
      return course;
    }),

  // Get courses by status
  getByStatus: procedure
    .input(z.object({ status: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(courses)
        .where(eq(courses.status, input.status));
    }),

  // Search courses by title
  search: procedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(courses)
        .where(like(courses.course, `%${input.query}%`));
    }),

  // Create a new course
  create: procedure
    .input(z.object({
      recordId: z.string(),
      course: z.string(),
      status: z.string(),
      courseSlug: z.string(),
      courseUrl: z.string().optional(),
      shortCourseDescription: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [newCourse] = await ctx.db
        .insert(courses)
        .values(input)
        .returning();
      return newCourse;
    }),

  // Update course
  update: procedure
    .input(z.object({
      recordId: z.string(),
      course: z.string().optional(),
      status: z.string().optional(),
      courseSlug: z.string().optional(),
      courseUrl: z.string().optional(),
      shortCourseDescription: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { recordId, ...updateData } = input;
      const [updatedCourse] = await ctx.db
        .update(courses)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(courses.recordId, recordId))
        .returning();
      return updatedCourse;
    }),

  // Delete course
  delete: procedure
    .input(z.object({ recordId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [deletedCourse] = await ctx.db
        .delete(courses)
        .where(eq(courses.recordId, input.recordId))
        .returning();
      return deletedCourse;
    }),

  // Get units for a course
  getUnits: procedure
    .input(z.object({ courseSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(units)
        .where(eq(units.courseSlug, input.courseSlug));
    }),

  // Get exercises for a course
  getExercises: procedure
    .input(z.object({ courseSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(exercises)
        .where(eq(exercises.courseSlug, input.courseSlug));
    }),
});