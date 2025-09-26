import { router, procedure } from "../trpc";
import { units } from "@/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const unitsRouter = router({
  // Get all units
  getAll: procedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(units);
  }),

  // Get unit by ID
  getById: procedure.input(z.string().uuid()).query(async ({ ctx, input }) => {
    const result = await ctx.db.select().from(units).where(eq(units.id, input));
    return result[0];
  }),
});
