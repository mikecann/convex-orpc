# Convex more like oRPC

I nerd-sniped myself into experimenting with this to see what the Convex API would look like but written in a more fluent way like oRPC. 

Borrowed heavily from: https://orpc.unnoq.com/learn-and-contribute/overview and helped out by AI.

```ts

// A middleware that checks if the user is authenticated
const authMiddleware = cvx.query().middleware(async ({ context, next }) => {
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
export const listNumbersAuth = cvx
  .query()
  .use(authMiddleware)
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
```

Checkout /convex/myFunctions.ts for more examples