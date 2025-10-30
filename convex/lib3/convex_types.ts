import type { PropertyValidators, GenericValidator } from "convex/values";
import type {
  QueryCtx as ConvexQueryCtx,
  MutationCtx as ConvexMutationCtx,
  ActionCtx as ConvexActionCtx,
} from "../_generated/server";

// Context type
export type Context = Record<PropertyKey, any>;

// Convex validator types
export type ConvexArgsValidator = PropertyValidators;
export type ConvexReturnsValidator = GenericValidator;

// Infer types from Convex validators
export type InferArgs<T extends ConvexArgsValidator> = {
  [K in keyof T]: T[K] extends GenericValidator
    ? T[K]["isOptional"] extends true
      ? T[K]["type"] | undefined
      : T[K]["type"]
    : never;
};

export type InferReturns<T extends ConvexReturnsValidator> = T["type"];

// Convex context types
export type QueryCtx = ConvexQueryCtx;
export type MutationCtx = ConvexMutationCtx;
export type ActionCtx = ConvexActionCtx;

// Function types
export type FunctionType = "query" | "mutation" | "action";
export type Visibility = "public" | "internal";

