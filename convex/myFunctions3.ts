import { v } from "convex/values";
import { udf } from "./lib/udf_builder";
import { os } from "./lib3/builder";
import { z } from "zod";
import { QueryCtx } from "./_generated/server";

// Define reusable authentication middleware
const authMiddleware = os
  .$context<{ user?: { id: string; name: string } }>()
  .middleware(async ({ context, next }) => {
    if (!context.user) {
      throw new Error("Unauthorized");
    }

    return next({
      context: {
        user: context.user,
      },
    });
  });

const convexQueryMiddleware = os
  .$context<{ convex?: QueryCtx }>()
  .middleware(async ({ context, next }) => {
    if (!context.convex) {
      throw new Error("Convex query context not found");
    }

    return next({
      context: {
        ...context.convex,
      },
    });
  });

// Public procedure with input validation
export const listPlanet = os
  .use(convexQueryMiddleware)
  .use(authMiddleware)
  .input(
    z.object({
      limit: z.number().int().min(1).max(100).optional(),
      cursor: z.number().int().min(0).default(0),
    }),
  )
  .handler(async ({ context, input }) => {

    console.log("CONVEX DB", context.db);
    
    console.log(context.user);
    // Fetch planets with pagination
    return [{ id: 1, name: "Earth" }];
  })
