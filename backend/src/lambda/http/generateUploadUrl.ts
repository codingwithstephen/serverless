import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  signatureVersion: 'v4' // Use Sigv4 algorithm
});

const bucketName = process.env.IMAGES_S3_BUCKET;

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    return getSignedUrl(todoId);
  }
)
function getSignedUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: Number(process.env.SIGNED_URL_EXPIRATION)
  })
}
handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
