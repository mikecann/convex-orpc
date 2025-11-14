import { v } from 'convex/values'
import { convex } from './lib'
import { authMiddleware } from './middleware'
import { api } from './_generated/api'

export const listNumbers = convex
  .query()
  .input({ count: v.number() })
  .handler(async ({ context, input }) => {
    const numbers = await context.db
      .query('numbers')
      .order('desc')
      .take(input.count)
    return {
      viewer: (await context.auth.getUserIdentity())?.name ?? null,
      numbers: numbers.reverse().map((number) => number.value),
    }
  })

export const addNumber = convex
  .mutation()
  .input({ value: v.number() })
  .returns(v.id('numbers'))
  .handler(async ({ context, input }) => {
    const id = await context.db.insert('numbers', { value: input.value })
    return id
  })

export const listNumbersAuth = convex
  .query()
  .use(authMiddleware)
  .input({ count: v.number() })
  .handler(async ({ context, input }) => {
    const numbers = await context.db
      .query('numbers')
      .order('desc')
      .take(input.count)

    return {
      viewer: context.user.name, // user is available from middleware!
      numbers: numbers.reverse().map((number) => number.value),
    }
  })

export const myAction = convex
  .action()
  .input({ first: v.number() })
  .handler(async ({ context, input }) => {
    const data = await context.runQuery(api.myFunctions.listNumbers, {
      count: 10,
    })
    console.log(data)

    await context.runMutation(api.myFunctions.addNumber, {
      value: input.first,
    })
  })
