import { router } from "../trpc";
import { healthRouter } from "./health";
import { chunksRouter } from "./chunks";
import { unitsRouter } from "./units";
import { resourcesRouter } from "./resources";
import { exercisesRouter } from "./exercises";

export const appRouter = router({
  health: healthRouter,
  chunks: chunksRouter,
  units: unitsRouter,
  resources: resourcesRouter,
  exercises: exercisesRouter,
});

export type AppRouter = typeof appRouter;
