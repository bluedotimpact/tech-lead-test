import { router, procedure } from "../trpc";
import { exercises } from "@/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const exercisesRouter = router({
  // Get all exercises from chunk
  getAll: procedure.input(z.string().uuid()).query(async ({ ctx, input }) => {
    return await ctx.db.select().from(exercises).where(eq(exercises.chunkId, input));
  }),

  // Get exercise by ID
  getById: procedure.input(z.string().uuid()).query(async ({ ctx, input }) => {
    const result = await ctx.db.select().from(exercises).where(eq(exercises.id, input));
    return result[0];
  }),
});
