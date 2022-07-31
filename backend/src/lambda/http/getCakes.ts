import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getCakes } from '../../businessLogic/cakes'
import { getUserId } from '../utils';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    
    const cakes = await getCakes(getUserId(event))

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: cakes
      })
    }
  })
handler.use(
  cors({
    credentials: true
  })
)
