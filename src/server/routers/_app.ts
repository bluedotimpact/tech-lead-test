import { router } from '../trpc';
import { greetingRouter } from './greeting';
import { courseRouter } from './course';

export const appRouter = router({
  greeting: greetingRouter,
  course: courseRouter,
});

export type AppRouter = typeof appRouter;