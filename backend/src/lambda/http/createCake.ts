import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateCakeRequest } from '../../requests/CreateCakeRequest'
import { getUserId } from '../utils';
import { createCake } from '../../businessLogic/cakes'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    
    const newCake: CreateCakeRequest = JSON.parse(event.body)

    const newItem = await createCake(getUserId(event), newCake);

    return {
      statusCode: 201,
      body: JSON.stringify({item: newItem})
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)