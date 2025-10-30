import {
  query,
  mutation,
  action,
  internalQuery,
  internalMutation,
  internalAction,
} from "../_generated/server";
import type { RegisteredQuery, RegisteredMutation, RegisteredAction } from "convex/server";
import type { IntersectPick } from "@orpc/shared";
import type { ConvexMiddleware, AnyConvexMiddleware } from "./convex_middleware";
import type {
  Context,
  ConvexArgsValidator,
  ConvexReturnsValidator,
  InferArgs,
  InferReturns,
  FunctionType,
  Visibility,
  QueryCtx,
  MutationCtx,
  ActionCtx,
} from "./convex_types";

interface ConvexBuilderDef<
  TFunctionType extends FunctionType | undefined,
  TInitialContext extends Context,
  TCurrentContext extends Context,
  TArgsValidator extends ConvexArgsValidator | undefined,
  TReturnsValidator extends ConvexReturnsValidator | undefined,
  TVisibility extends Visibility,
> {
  functionType?: TFunctionType;
  middlewares: readonly AnyConvexMiddleware[];
  argsValidator?: TArgsValidator;
  returnsValidator?: TReturnsValidator;
  visibility: TVisibility;
}

export class ConvexBuilder<
  TFunctionType extends FunctionType | undefined = undefined,
  TInitialContext extends Context = Record<never, never>,
  TCurrentContext extends Context = Record<never, never>,
  TArgsValidator extends ConvexArgsValidator | undefined = undefined,
  TReturnsValidator extends ConvexReturnsValidator | undefined = undefined,
  TVisibility extends Visibility = "public",
> {
  private def: ConvexBuilderDef<
    TFunctionType,
    TInitialContext,
    TCurrentContext,
    TArgsValidator,
    TReturnsValidator,
    TVisibility
  >;

  constructor(
    def: ConvexBuilderDef<
      TFunctionType,
      TInitialContext,
      TCurrentContext,
      TArgsValidator,
      TReturnsValidator,
      TVisibility
    >
  ) {
    this.def = def;
  }

  /**
   * Sets the initial context type hint for middleware.
   */
  $context<U extends Context>(): ConvexBuilder<
    TFunctionType,
    U & Record<never, never>,
    U,
    TArgsValidator,
    TReturnsValidator,
    TVisibility
  > {
    return new ConvexBuilder({
      ...this.def,
      middlewares: [],
    });
  }

  /**
   * Creates a middleware function.
   */
  middleware<UOutContext extends Context>(
    middleware: ConvexMiddleware<TInitialContext, UOutContext>
  ): ConvexMiddleware<TInitialContext, UOutContext> {
    return middleware;
  }

  /**
   * Applies middleware to the pipeline.
   */
  use<UOutContext extends Context>(
    middleware: ConvexMiddleware<TCurrentContext, UOutContext>
  ): ConvexBuilder<
    TFunctionType,
    TInitialContext,
    TCurrentContext & UOutContext,
    TArgsValidator,
    TReturnsValidator,
    TVisibility
  > {
    return new ConvexBuilder({
      ...this.def,
      middlewares: [...this.def.middlewares, middleware],
    });
  }

  /**
   * Sets this as a query function.
   */
  query(): ConvexBuilder<
    "query",
    TInitialContext extends Record<never, never> ? QueryCtx : TInitialContext,
    TCurrentContext extends Record<never, never> ? QueryCtx : TCurrentContext,
    TArgsValidator,
    TReturnsValidator,
    TVisibility
  > {
    return new ConvexBuilder({
      ...this.def,
      functionType: "query",
    }) as any;
  }

  /**
   * Sets this as a mutation function.
   */
  mutation(): ConvexBuilder<
    "mutation",
    TInitialContext extends Record<never, never> ? MutationCtx : TInitialContext,
    TCurrentContext extends Record<never, never> ? MutationCtx : TCurrentContext,
    TArgsValidator,
    TReturnsValidator,
    TVisibility
  > {
    return new ConvexBuilder({
      ...this.def,
      functionType: "mutation",
    }) as any;
  }

  /**
   * Sets this as an action function.
   */
  action(): ConvexBuilder<
    "action",
    TInitialContext extends Record<never, never> ? ActionCtx : TInitialContext,
    TCurrentContext extends Record<never, never> ? ActionCtx : TCurrentContext,
    TArgsValidator,
    TReturnsValidator,
    TVisibility
  > {
    return new ConvexBuilder({
      ...this.def,
      functionType: "action",
    }) as any;
  }

  /**
   * Sets the function as internal.
   */
  internal(): ConvexBuilder<
    TFunctionType,
    TInitialContext,
    TCurrentContext,
    TArgsValidator,
    TReturnsValidator,
    "internal"
  > {
    return new ConvexBuilder({
      ...this.def,
      visibility: "internal",
    });
  }

  /**
   * Sets the input validation schema (Convex args validators).
   */
  args<UArgsValidator extends ConvexArgsValidator>(
    validator: UArgsValidator
  ): ConvexBuilder<
    TFunctionType,
    TInitialContext,
    TCurrentContext,
    UArgsValidator,
    TReturnsValidator,
    TVisibility
  > {
    return new ConvexBuilder({
      ...this.def,
      argsValidator: validator,
    });
  }

  /**
   * Sets the output validation schema (Convex returns validator).
   */
  returns<UReturnsValidator extends ConvexReturnsValidator>(
    validator: UReturnsValidator
  ): ConvexBuilder<
    TFunctionType,
    TInitialContext,
    TCurrentContext,
    TArgsValidator,
    UReturnsValidator,
    TVisibility
  > {
    return new ConvexBuilder({
      ...this.def,
      returnsValidator: validator,
    });
  }

  /**
   * Defines the handler and creates the registered Convex function.
   */
  handler<TReturn>(
    handlerFn: (
      ctx: TCurrentContext,
      args: TArgsValidator extends ConvexArgsValidator
        ? InferArgs<TArgsValidator>
        : Record<never, never>
    ) => Promise<TReturn>
  ): TFunctionType extends "query"
    ? TVisibility extends "public"
      ? RegisteredQuery<
          "public",
          TArgsValidator extends ConvexArgsValidator
            ? InferArgs<TArgsValidator>
            : Record<never, never>,
          Promise<TReturn>
        >
      : RegisteredQuery<
          "internal",
          TArgsValidator extends ConvexArgsValidator
            ? InferArgs<TArgsValidator>
            : Record<never, never>,
          Promise<TReturn>
        >
    : TFunctionType extends "mutation"
    ? TVisibility extends "public"
      ? RegisteredMutation<
          "public",
          TArgsValidator extends ConvexArgsValidator
            ? InferArgs<TArgsValidator>
            : Record<never, never>,
          Promise<TReturn>
        >
      : RegisteredMutation<
          "internal",
          TArgsValidator extends ConvexArgsValidator
            ? InferArgs<TArgsValidator>
            : Record<never, never>,
          Promise<TReturn>
        >
    : TFunctionType extends "action"
    ? TVisibility extends "public"
      ? RegisteredAction<
          "public",
          TArgsValidator extends ConvexArgsValidator
            ? InferArgs<TArgsValidator>
            : Record<never, never>,
          Promise<TReturn>
        >
      : RegisteredAction<
          "internal",
          TArgsValidator extends ConvexArgsValidator
            ? InferArgs<TArgsValidator>
            : Record<never, never>,
          Promise<TReturn>
        >
    : never {
    const { functionType, middlewares, argsValidator, returnsValidator, visibility } = this.def;

    if (!functionType) {
      throw new Error("Function type not set. Call .query(), .mutation(), or .action() first.");
    }

    // Compose middleware with handler
    const composedHandler = async (
      baseCtx: QueryCtx | MutationCtx | ActionCtx,
      baseArgs: TArgsValidator extends ConvexArgsValidator ? InferArgs<TArgsValidator> : Record<never, never>
    ) => {
      let currentContext: any = baseCtx;

      // Run middleware chain
      for (const middleware of middlewares) {
        const result = await middleware({
          context: currentContext,
          next: async (options) => ({ context: options.context }),
        });
        currentContext = result.context;
      }

      return handlerFn(currentContext as TCurrentContext, baseArgs);
    };

    // Build Convex config
    const config = {
      args: argsValidator || {},
      ...(returnsValidator ? { returns: returnsValidator } : {}),
      handler: composedHandler,
    } as any;

    // Register with appropriate Convex function
    if (functionType === "query") {
      return (visibility === "public" ? query(config) : internalQuery(config)) as any;
    }

    if (functionType === "mutation") {
      return (visibility === "public" ? mutation(config) : internalMutation(config)) as any;
    }

    if (functionType === "action") {
      return (visibility === "public" ? action(config) : internalAction(config)) as any;
    }

    throw new Error(`Unknown function type: ${functionType}`);
  }
}

export const cvx = new ConvexBuilder<
  undefined,
  Record<never, never>,
  Record<never, never>,
  undefined,
  undefined,
  "public"
>({
  middlewares: [],
  visibility: "public",
});

