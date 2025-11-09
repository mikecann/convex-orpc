import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

test("experiment", async () => {
  const t = convexTest(schema);
  await t.mutation(api.myFunctions.addNumber, { value: 23 });
  const { numbers } = await t.query(api.myFunctions.listNumbersSimple, {
    count: 10,
  });
  expect(numbers).toEqual([23]);
});
