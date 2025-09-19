import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { db } from "@/db";

export function createContext(opts: CreateNextContextOptions) {
  return {
    req: opts.req,
    res: opts.res,
    db,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
