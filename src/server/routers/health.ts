import { router, procedure } from '../trpc';
import { courses, units, chunks, resources, exercises } from '@/db/schema';
import { count } from 'drizzle-orm';

export const healthRouter = router({
  // Simple endpoint to confirm tRPC is working
  check: procedure
    .query(() => {
      return {
        status: 'healthy',
        message: 'tRPC is working correctly!',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      };
    }),

  // Check if database connection is working and data exists in database tables
  database: procedure.query(async ({ ctx }) => {
    try {
      const [courseCount] = await ctx.db.select({ count: count() }).from(courses);
      const [unitCount] = await ctx.db.select({ count: count() }).from(units);
      const [chunkCount] = await ctx.db.select({ count: count() }).from(chunks);
      const [resourceCount] = await ctx.db.select({ count: count() }).from(resources);
      const [exerciseCount] = await ctx.db.select({ count: count() }).from(exercises);
      
      return {
        status: 'success',
        message: 'Database connection successful',
        tableData: {
          courses: {
            exists: true,
            count: courseCount.count,
          },
          units: {
            exists: true,
            count: unitCount.count,
          },
          chunks: {
            exists: true,
            count: chunkCount.count,
          },
          resources: {
            exists: true,
            count: resourceCount.count,
          },
          exercises: {
            exists: true,
            count: exerciseCount.count,
          },
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to check database tables',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }),
});