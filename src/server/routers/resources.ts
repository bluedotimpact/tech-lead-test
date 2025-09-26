import { router, procedure } from "../trpc";
import { resources } from "@/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const resourcesRouter = router({
  // Get all resources from chunk
  getAll: procedure.input(z.string().uuid()).query(async ({ ctx, input }) => {
    return await ctx.db.select().from(resources).where(eq(resources.chunkId, input));
  }),
  
  // Get resource by ID
  getById: procedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(resources)
        .where(eq(resources.id, input));
      return result[0];
    }),
});
