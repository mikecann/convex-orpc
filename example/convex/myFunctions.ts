import { v } from "convex/values";
import { convex } from "fluent-convex";
import { z } from "zod";

// Example: Simple query without middleware
export const listNumbersSimple = convex
  .query()
  .input({ count: v.number() })
  .handler(async ({ context, input }) => {
    const numbers = await context.db
      .query("numbers")
      .order("desc")
      .take(input.count);

    return {
      numbers: numbers.reverse().map((number) => number.value),
    };
  });

// export const doSomethingWithNumbers = convex.query().input({ count: v.number() }).handler(async ({ context, input }) => {
//   const { numbers } = await listNumbersSimple({ context, input });

//   return numbers.map(n => String(n)).join(", ");
// });

export const listNumbersSimpleWithConvexValidators = convex
  .query()
  .input(v.object({ count: v.number() }))
  .returns(v.object({ numbers: v.array(v.number()) }))
  .handler(async ({ context, input }) => {
    const numbers = await context.db
      .query("numbers")
      .order("desc")
      .take(input.count);

    return {
      numbers: numbers.reverse().map((number) => number.value),
    };
  });

export const listNumbersSimpleWithZod = convex
  .query()
  .input(z.object({ count: z.number() }))
  .returns(z.object({ numbers: z.array(z.number()) }))
  .handler(async ({ context, input }) => {
    const numbers = await context.db
      .query("numbers")
      .order("desc")
      .take(input.count);

    return {
      numbers: numbers.reverse().map((number) => number.value),
    };
  });

// A middleware that checks if the user is authenticated
const authMiddleware = convex.query().middleware(async ({ context, next }) => {
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
});

// A query that requires authentication
export const listNumbersAuth = convex
  .query()
  .use(authMiddleware)
  .input({ count: v.number() })
  .handler(async ({ context, input }) => {
    const numbers = await context.db
      .query("numbers")
      .order("desc")
      .take(input.count);

    return {
      viewer: context.user.name, // user is available from middleware!
      numbers: numbers.reverse().map((number) => number.value),
    };
  });

// Mutation with the same middleware
export const addNumber = convex
  .mutation()
  .use(authMiddleware)
  .input({ value: v.number() })
  .returns(v.id("numbers"))
  .handler(async ({ context, input }) => {
    console.log(`User ${context.user.name} is adding ${input.value}`);

    return await context.db.insert("numbers", { value: input.value });
  });

export const addNumberUnauth = convex
  .mutation()
  .input({ value: v.number() })
  .returns(v.id("numbers"))
  .handler(async ({ context, input }) => {
    return await context.db.insert("numbers", { value: input.value });
  });

// Multiple middleware composition
const addTimestamp = convex.query().middleware(async ({ context, next }) => {
  return next({
    context: {
      ...context,
      timestamp: Date.now(),
    },
  });
});

export const listNumbersWithTimestamp = convex
  .query()
  .use(authMiddleware)
  .use(addTimestamp)
  .input({ count: v.number() })
  .handler(async ({ context, input }) => {
    const numbers = await context.db
      .query("numbers")
      .order("desc")
      .take(input.count);

    return {
      viewer: context.user.name,
      timestamp: context.timestamp,
      numbers: numbers.map((n) => n.value),
    };
  });

// Internal query
export const internalListAll = convex
  .query()
  .internal()
  .input({})
  .handler(async ({ context }) => {
    const numbers = await context.db.query("numbers").collect();

    return numbers;
  });

// You can also define middleware inline
export const quickQuery = convex
  .query()
  .use(
    convex.query().middleware(async ({ context, next }) => {
      return next({
        context: {
          ...context,
          requestId: Math.random().toString(36).substring(7),
        },
      });
    }),
  )
  .input({ limit: v.number() })
  .handler(async ({ context, input }) => {
    console.log(`Request ${context.requestId}`);
    const numbers = await context.db.query("numbers").take(input.limit);
    return numbers;
  });
