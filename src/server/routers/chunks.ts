import { router, procedure } from "../trpc";
import { chunks } from "@/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const chunksRouter = router({
  // Get all chunks
  getAll: procedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(chunks);
  }),

  // Get chunk by ID
  getById: procedure.input(z.string().uuid()).query(async ({ ctx, input }) => {
    const result = await ctx.db.select().from(chunks).where(eq(chunks.id, input));
    return result[0];
  }),
});
