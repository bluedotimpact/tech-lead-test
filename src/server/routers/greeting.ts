import { z } from 'zod';
import { router, procedure } from '../trpc';

export const greetingRouter = router({
  hello: procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name}!`,
        timestamp: new Date().toISOString(),
      };
    }),
  
  sayGoodbye: procedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      return {
        message: `Goodbye ${input.name}!`,
        timestamp: new Date().toISOString(),
      };
    }),
});