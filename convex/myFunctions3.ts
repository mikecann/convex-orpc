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
export const listNumbers = os
  .use(convexQueryMiddleware)
  .use(authMiddleware)
  .input(
    z.object({
      count: z.number(),
    }),
  )
  .handler(async ({ context, input }) => {
    const numbers = await context.db
      .query("numbers")
      .order("desc")
      .take(input.count);

    return numbers.reverse().map((number) => number.value);
  });
