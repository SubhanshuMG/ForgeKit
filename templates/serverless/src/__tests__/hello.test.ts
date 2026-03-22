import { handler } from '../handlers/hello'
import { APIGatewayProxyEvent, Context } from 'aws-lambda'

const mockContext = {} as Context
const mockCallback = jest.fn()

describe('hello handler', () => {
  it('returns Hello World when no name provided', async () => {
    const event = { queryStringParameters: null } as unknown as APIGatewayProxyEvent
    const result = await handler(event, mockContext, mockCallback)
    expect(result).toBeDefined()
    if (result) {
      expect(result.statusCode).toBe(200)
      const body = JSON.parse(result.body)
      expect(body.message).toBe('Hello, World!')
    }
  })

  it('returns personalized greeting when name provided', async () => {
    const event = { queryStringParameters: { name: 'ForgeKit' } } as unknown as APIGatewayProxyEvent
    const result = await handler(event, mockContext, mockCallback)
    if (result) {
      const body = JSON.parse(result.body)
      expect(body.message).toBe('Hello, ForgeKit!')
    }
  })
})
