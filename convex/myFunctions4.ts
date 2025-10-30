import { v } from "convex/values";
import { cvx } from "./lib3/convex_builder";

// Example: Simple query without middleware
export const listNumbersSimple = cvx
  .query()
  .args({ count: v.number() })
  .handler(async (ctx, args) => {
    const numbers = await ctx.db
      .query("numbers")
      .order("desc")
      .take(args.count);

    return {
      viewer: (await ctx.auth.getUserIdentity())?.name ?? null,
      numbers: numbers.reverse().map((number) => number.value),
    };
  });

// Example: Reusable authentication middleware
// We use a function that creates the middleware to make it reusable
const requireAuth =
  <TCtx extends { auth: { getUserIdentity: () => Promise<any> } }>() =>
  async ({ context, next }: { context: TCtx; next: any }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    return next({
      context: {
        ...context,
        user: {
          id: identity.subject,
          name: identity.name ?? "Unknown",
        },
      },
    });
  };

export const listNumbersAuth = cvx
  .query()
  .use(requireAuth())
  .args({ count: v.number() })
  .handler(async (ctx, args) => {
    const numbers = await ctx.db
      .query("numbers")
      .order("desc")
      .take(args.count);

    return {
      viewer: ctx.user.name, // user is available from middleware!
      numbers: numbers.reverse().map((number) => number.value),
    };
  });

// Example: Mutation with middleware
export const addNumber = cvx
  .mutation()
  //.use(requireAuth())
  .args({ value: v.number() })
  .returns(v.id("numbers"))
  .handler(async (ctx, args) => {
    //console.log(`User ${ctx.user.name} is adding ${args.value}`);
    return await ctx.db.insert("numbers", { value: args.value });
  });

// Example: Internal query
export const internalListAll = cvx
  .query()
  .internal()
  .args({})
  .handler(async (ctx, _args) => {
    const numbers = await ctx.db.query("numbers").collect();
    return numbers;
  });

// Example: Multiple middleware composition
const addTimestamp =
  <TCtx extends Record<string, any>>() =>
  async ({ context, next }: { context: TCtx; next: any }) => {
    return next({
      context: {
        ...context,
        timestamp: Date.now(),
      },
    });
  };

export const listNumbersWithTimestamp = cvx
  .query()
  .use(requireAuth())
  .use(addTimestamp())
  .args({ count: v.number() })
  .handler(async (ctx, args) => {
    const numbers = await ctx.db
      .query("numbers")
      .order("desc")
      .take(args.count);

    return {
      viewer: ctx.user.name,
      timestamp: ctx.timestamp,
      numbers: numbers.map((n) => n.value),
    };
  });
