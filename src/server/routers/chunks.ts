import { router, procedure } from "../trpc";
import { chunks, units } from "@/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const chunksRouter = router({
  // Get all chunks with unit information, sorted by unit order then chunk order
  getAll: procedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({
        chunk: chunks,
        unit: units,
      })
      .from(chunks)
      .innerJoin(units, eq(chunks.unitId, units.id))
      .orderBy(units.order, chunks.order);

    return result;
  }),

  // Get chunk by ID
  getById: procedure.input(z.string().uuid()).query(async ({ ctx, input }) => {
    const result = await ctx.db.select().from(chunks).where(eq(chunks.id, input));
    return result[0];
  }),
});
